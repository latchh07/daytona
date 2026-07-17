import asyncio
from engine.models import TrialResult, RunConfig, TestDomain, TerminalState, BrowserAction
from engine.adapter import TargetAgentAdapter
from engine.detectors import ObstructionDetector
from engine.scoring import calc_cancellation_roach_scores
from engine.scenario_generator import ScenarioGenerator
from engine.counterfactual_judge import CounterfactualJudge
from website_test_agent import run_naive_agent_on_page

class CancellationRoachAgent:
    def __init__(self):
        self.obstruction_detector = ObstructionDetector()
        self.scenario_generator = ScenarioGenerator()
        self.counterfactual_judge = CounterfactualJudge()

    async def run(self, page, target_adapter: TargetAgentAdapter, config: RunConfig, queue=None) -> list[TrialResult]:
        results = []
        
        # Inject neon cursor
        await page.add_style_tag(content="""
            .wme-cursor-cr {
                position: fixed;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #30d158;
                box-shadow: 0 0 10px 2px #30d158;
                pointer-events: none;
                z-index: 999999;
                transition: top 0.1s, left 0.1s;
            }
        """)
        
        await page.evaluate("""
            const cursor = document.createElement('div');
            cursor.className = 'wme-cursor-cr';
            document.body.appendChild(cursor);
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
        """)

        for i in range(1, config.repeat_count + 1):
            raw_counts = {'A': 0, 'B': 3, 'O': 1, 'F': 0.0, 'P': 0, 'J': 0, 'Q': 0, 'accepted_alternative': False, 'outcome': 'abandonment', 'S': 0}
            patterns = []
            
            await page.goto(f"{config.target_url}/dashboard")
            
            # 1. Generate Scenario
            print(f"\n[{TestDomain.CANCELLATION_ROACH.value} - Run {i}] Generating scenario...")
            scenario = await self.scenario_generator.generate_scenario(TestDomain.CANCELLATION_ROACH, "MockUI Cancellation Flow")
            
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
                print(f"[NaiveAgent - cancellation_roach] Step {raw_counts['S']}: {action_type} {selector} -> {explanation}")
                
                content = await page.content()
                detected_obstruction = self.obstruction_detector.detect(content)
                if detected_obstruction:
                    patterns.extend(detected_obstruction)
                if queue:
                    await queue.put({
                        "type": "step",
                        "domain": TestDomain.CANCELLATION_ROACH.value,
                        "step": raw_counts['S'],
                        "action": action_type,
                        "selector": selector,
                        "explanation": explanation,
                        "patterns": [{"type": p.pattern_type.value, "text": p.text_snippet} for p in detected_obstruction] if detected_obstruction else []
                    })
                    
            print("[NaiveAgent - cancellation_roach] Starting execution...")
            traj, retry_count = await run_naive_agent_on_page(page, scenario.visible_task, max_steps=20, step_callback=on_step)
            
            raw_counts['retry_count'] = retry_count
            raw_counts['resistance_exhibited'] = retry_count > 0
            
            # Extract trace from adapter
            action_trace = await target_adapter.get_action_trace()
            
            # Update step count
            raw_counts['A'] = raw_counts['S']
            
            # Check terminal state
            terminal_state = TerminalState.UNABLE_TO_CANCEL_ONLINE
            
            print(f"\n[CounterfactualJudge] Evaluating trajectory...")
            critical_failure, judge_explanation = await self.counterfactual_judge.evaluate_trajectory(
                scenario, action_trace, terminal_state, patterns
            )
            print(f"[CounterfactualJudge] Verdict: Critical Failure={critical_failure}. {judge_explanation}")
            
            scores = calc_cancellation_roach_scores(raw_counts)
            
            result = TrialResult(
                domain=TestDomain.CANCELLATION_ROACH,
                run_index=i,
                raw_counts=raw_counts,
                sub_scores={
                    "nav_score": scores["nav_score"],
                    "roach_motel_web": scores["roach_motel_web"],
                    "agent_obstruction": scores["agent_obstruction"],
                    "web_obstruction": scores["web_obstruction"],
                    "agent_retention": scores["agent_retention"],
                    "web_retention": scores["web_retention"],
                    "outcome_score": scores["outcome_score"]
                },
                agent_score=scores["agent_score"],
                website_score=scores["website_score"],
                terminal_state=TerminalState.UNABLE_TO_CANCEL_ONLINE,
                duration_seconds=15.0,
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
