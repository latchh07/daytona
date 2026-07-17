import asyncio
from engine.models import TrialResult, RunConfig, TestDomain, TerminalState, DetectedPattern, PatternType, ConfirmshamingCategory
from engine.adapter import TargetAgentAdapter
from engine.detectors import ConfirmshamingClassifier
from engine.scoring import calc_confirmshaming_scores
from engine.scenario_generator import ScenarioGenerator
from engine.counterfactual_judge import CounterfactualJudge
from website_test_agent import run_naive_agent_on_page

class ConfirmshamingAgent:
    def __init__(self):
        self.classifier = ConfirmshamingClassifier()
        self.scenario_generator = ScenarioGenerator()
        self.counterfactual_judge = CounterfactualJudge()

    async def run(self, page, target_adapter: TargetAgentAdapter, config: RunConfig, queue=None) -> list[TrialResult]:
        results = []
        
        # Inject neon cursor
        await page.add_style_tag(content="""
            .wme-cursor-cs {
                position: fixed;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #0a84ff;
                box-shadow: 0 0 10px 2px #0a84ff;
                pointer-events: none;
                z-index: 999999;
                transition: top 0.1s, left 0.1s;
            }
        """)
        
        await page.evaluate("""
            const cursor = document.createElement('div');
            cursor.className = 'wme-cursor-cs';
            document.body.appendChild(cursor);
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
        """)

        for i in range(1, config.repeat_count + 1):
            raw_counts = {'A': 0, 'B': 0, 'I': 0, 'T': 0, 'delta': 0, 'S': 0}
            patterns = []
            
            await page.goto(f"{config.target_url}/dashboard")
            
            # 1. Generate Scenario
            print(f"\n[{TestDomain.CONFIRMSHAMING.value} - Run {i}] Generating scenario...")
            scenario = await self.scenario_generator.generate_scenario(TestDomain.CONFIRMSHAMING, "MockUI Cancellation Flow with Confirmshaming")
            
            print(f"\n--- SCENARIO GENERATED ---")
            print(f"Persona: {scenario.hidden_contract.persona}")
            print(f"Visible Task: {scenario.visible_task}")
            print(f"Hard Constraints: {scenario.hidden_contract.hard_constraints}")
            print("--------------------------\n")
            
            async def on_step(page, action):
                raw_counts['S'] += 1
                action_type = action.get('action', 'unknown')
                selector = action.get('selector', '')
                explanation = action.get('explanation', '')
                print(f"[NaiveAgent - confirmshaming] Step {raw_counts['S']}: {action_type} {selector} -> {explanation}")
                
                content = await page.content()
                category, confidence = self.classifier.classify(content)
                if category != ConfirmshamingCategory.NEUTRAL:
                    pattern = DetectedPattern(
                        pattern_type=PatternType.CONFIRMSHAMING,
                        category=category.value,
                        confidence=confidence,
                        page_url=page.url,
                        explanation=f"Detected confirmshaming: {category.value}"
                    )
                    patterns.append(pattern)
                    raw_counts['A'] += 1
                    raw_counts['T'] += 1
                    print(f"    [Detector] Found Confirmshaming: {category.value}")

                if queue:
                    await queue.put({
                        "type": "step",
                        "domain": TestDomain.CONFIRMSHAMING.value,
                        "step": raw_counts['S'],
                        "action": action_type,
                        "selector": selector,
                        "explanation": explanation,
                        "patterns": [{"type": "confirmshaming", "text": category.value}] if category != ConfirmshamingCategory.NEUTRAL else []
                    })
            
            print("[NaiveAgent - confirmshaming] Starting execution...")
            traj, retry_count = await run_naive_agent_on_page(page, scenario.visible_task, max_steps=20, step_callback=on_step)
            
            raw_counts['retry_count'] = retry_count
            raw_counts['resistance_exhibited'] = retry_count > 0
            
            # Extract trace from adapter
            action_trace = await target_adapter.get_action_trace()
            
            terminal_state = TerminalState.COMPLETED
            
            print(f"\n[CounterfactualJudge] Evaluating trajectory...")
            critical_failure, judge_explanation = await self.counterfactual_judge.evaluate_trajectory(
                scenario, action_trace, terminal_state, patterns
            )
            print(f"[CounterfactualJudge] Verdict: Critical Failure={critical_failure}. {judge_explanation}")
            
            # If critical failure on a confirmshaming scenario, the agent was likely influenced
            if critical_failure and raw_counts['T'] > 0:
                raw_counts['I'] += 1
                
            scores = calc_confirmshaming_scores(raw_counts)
            
            result = TrialResult(
                domain=TestDomain.CONFIRMSHAMING,
                run_index=i,
                raw_counts=raw_counts,
                sub_scores={
                    "detection_agent": scores["detection_agent"],
                    "detection_web": scores["detection_web"],
                    "agent_misalignment": scores["agent_misalignment"],
                    "friction_web": scores["friction_web"]
                },
                agent_score=scores["agent_score"],
                website_score=scores["website_score"],
                terminal_state=TerminalState.COMPLETED,
                duration_seconds=10.0,
                step_count=raw_counts['S'],
                critical_failure=critical_failure,
                scenario=scenario,
                retry_count=retry_count,
                resistance_exhibited=raw_counts['resistance_exhibited'],
                detected_patterns=patterns
            )
            results.append(result)
            
            await target_adapter.reset_session()
            
        return results
