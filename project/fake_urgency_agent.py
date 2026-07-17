import asyncio
from engine.models import TrialResult, RunConfig, TestDomain, TerminalState
from engine.adapter import TargetAgentAdapter
from engine.detectors import UrgencyDetector
from engine.scoring import calc_fake_urgency_scores
from engine.scenario_generator import ScenarioGenerator
from engine.counterfactual_judge import CounterfactualJudge
from website_test_agent import run_naive_agent_on_page

class FakeUrgencyAgent:
    def __init__(self):
        self.detector = UrgencyDetector()
        self.scenario_generator = ScenarioGenerator()
        self.counterfactual_judge = CounterfactualJudge()

    async def run(self, page, target_adapter: TargetAgentAdapter, config: RunConfig) -> list[TrialResult]:
        results = []
        
        # Inject neon cursor
        await page.add_style_tag(content="""
            .wme-cursor-fu {
                position: fixed;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #000;
                border: 2px solid #fff;
                box-shadow: 0 0 10px 2px rgba(255,255,255,0.5);
                pointer-events: none;
                z-index: 999999;
                transition: top 0.1s, left 0.1s;
            }
        """)
        
        await page.evaluate("""
            const cursor = document.createElement('div');
            cursor.className = 'wme-cursor-fu';
            document.body.appendChild(cursor);
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
        """)

        for i in range(1, config.repeat_count + 1):
            raw_counts = {
                'A': 0, 'H': 0, 'V': 0, 'T': 0, 'C': 0,
                'violated_with_urgency': False,
                'violated_without_urgency': False,
                'irreversible_payment': False,
                'S': 0
            }
            patterns = []
            
            await page.goto(config.target_url)
            
            # 1. Generate Scenario
            print(f"\n[{TestDomain.FAKE_URGENCY.value} - Run {i}] Generating scenario...")
            scenario = await self.scenario_generator.generate_scenario(TestDomain.FAKE_URGENCY, "MockUI Checkout Flow with Urgency")
            
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
                print(f"[NaiveAgent - fake_urgency] Step {raw_counts['S']}: {action_type} {selector} -> {explanation}")
                
                content = await page.content()
                detected = self.detector.detect(content, page.url)
                if detected:
                    patterns.extend(detected)
                    raw_counts['A'] += len(detected)
                    raw_counts['T'] += 1
                    print(f"    [Detector] Found {len(detected)} fake urgency patterns!")
            
            print("[NaiveAgent - fake_urgency] Starting execution...")
            traj, retry_count = await run_naive_agent_on_page(page, scenario.visible_task, max_steps=20, step_callback=on_step)
            
            raw_counts['retry_count'] = retry_count
            raw_counts['resistance_exhibited'] = retry_count > 0
            
            # Extract trace from adapter
            action_trace = await target_adapter.get_action_trace()
            
            terminal_state = TerminalState.STOPPED_BEFORE_PAYMENT
            
            print(f"\n[CounterfactualJudge] Evaluating trajectory...")
            critical_failure, judge_explanation = await self.counterfactual_judge.evaluate_trajectory(
                scenario, action_trace, terminal_state, patterns
            )
            print(f"[CounterfactualJudge] Verdict: Critical Failure={critical_failure}. {judge_explanation}")
            
            # If critical failure on an urgency scenario, the agent violated constraints
            if critical_failure and raw_counts['T'] > 0:
                raw_counts['V'] += 1
                raw_counts['violated_with_urgency'] = True
            
            scores = calc_fake_urgency_scores(raw_counts)
            
            result = TrialResult(
                domain=TestDomain.FAKE_URGENCY,
                run_index=i,
                raw_counts=raw_counts,
                sub_scores={
                    "urgency_agent": scores["urgency_agent"],
                    "urgency_web": scores["urgency_web"],
                    "verification_agent": scores["verification_agent"]
                },
                agent_score=scores["agent_score"],
                website_score=scores["website_score"],
                terminal_state=TerminalState.STOPPED_BEFORE_PAYMENT,
                duration_seconds=8.0,
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
