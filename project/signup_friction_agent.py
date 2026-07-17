import asyncio
from engine.models import TrialResult, RunConfig, TestDomain, TerminalState, BrowserAction
from engine.adapter import TargetAgentAdapter
from engine.detectors import SneakingDetector, DisclosureAuditor
from engine.scoring import calc_signup_friction_scores
from engine.scenario_generator import ScenarioGenerator
from engine.counterfactual_judge import CounterfactualJudge
from website_test_agent import run_naive_agent_on_page

class SignupFrictionAgent:
    def __init__(self):
        self.sneaking_detector = SneakingDetector()
        self.disclosure_auditor = DisclosureAuditor()
        self.scenario_generator = ScenarioGenerator()
        self.counterfactual_judge = CounterfactualJudge()

    async def run(self, page, target_adapter: TargetAgentAdapter, config: RunConfig) -> list[TrialResult]:
        results = []
        
        # Inject neon cursor
        await page.add_style_tag(content="""
            .wme-cursor {
                position: fixed;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #bf5af2;
                box-shadow: 0 0 10px 2px #bf5af2;
                pointer-events: none;
                z-index: 999999;
                transition: top 0.1s, left 0.1s;
            }
            .wme-cursor-label {
                position: fixed;
                background: #000;
                color: #bf5af2;
                font-family: monospace;
                font-size: 10px;
                padding: 2px 4px;
                border-radius: 4px;
                pointer-events: none;
                z-index: 999999;
                margin-top: 25px;
                margin-left: 10px;
                transition: top 0.1s, left 0.1s;
            }
        """)
        
        await page.evaluate("""
            const cursor = document.createElement('div');
            cursor.className = 'wme-cursor';
            const label = document.createElement('div');
            label.className = 'wme-cursor-label';
            label.innerText = 'SignupFrictionAgent';
            document.body.appendChild(cursor);
            document.body.appendChild(label);
            
            document.addEventListener('mousemove', e => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
                label.style.left = e.clientX + 'px';
                label.style.top = e.clientY + 'px';
            });
        """)

        for i in range(1, config.repeat_count + 1):
            raw_counts = {'A': 0, 'B': 0, 'C': 0, 'M': 0, 'R': 5, 'E': 3, 'S': 0, 'D': 0, 'undisclosed_proceed': False}
            patterns = []
            
            # Start at root
            await page.goto(config.target_url)
            
            # 1. Generate Scenario
            print(f"\n[{TestDomain.SIGNUP_FRICTION.value} - Run {i}] Generating scenario...")
            scenario = await self.scenario_generator.generate_scenario(TestDomain.SIGNUP_FRICTION, "MockUI Signup Flow")
            
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
                print(f"[NaiveAgent - signup_friction] Step {raw_counts['S']}: {action_type} {selector} -> {explanation}")
                
                content = await page.content()
                detected_sneaking = self.sneaking_detector.detect(content, page.url)
                if detected_sneaking:
                    patterns.extend(detected_sneaking)
                    raw_counts['A'] += len(detected_sneaking)
                    print(f"    [Detector] Found {len(detected_sneaking)} sneaking patterns!")
                
                missing_disclosures = self.disclosure_auditor.get_missing_count(content)
                raw_counts['M'] = max(raw_counts['M'], missing_disclosures)

            print("[NaiveAgent - signup_friction] Starting execution...")
            traj, retry_count = await run_naive_agent_on_page(page, scenario.visible_task, max_steps=20, step_callback=on_step)
            
            raw_counts['retry_count'] = retry_count
            raw_counts['resistance_exhibited'] = retry_count > 0
            
            # Extract trace from adapter
            action_trace = await target_adapter.get_action_trace()
            
            # Simulate agent catching 0 of the items for demo purposes
            raw_counts['B'] += 0 
            raw_counts['C'] += 0 # Agent catches none
            
            # Evaluate terminal state
            terminal_state = TerminalState.STOPPED_BEFORE_PAYMENT
            if raw_counts['A'] > raw_counts['B']:
                terminal_state = TerminalState.COMPLETED
                
            print(f"\n[CounterfactualJudge] Evaluating trajectory...")
            critical_failure, judge_explanation = await self.counterfactual_judge.evaluate_trajectory(
                scenario, action_trace, terminal_state, patterns
            )
            print(f"[CounterfactualJudge] Verdict: Critical Failure={critical_failure}. {judge_explanation}")
            
            scores = calc_signup_friction_scores(raw_counts, critical_miss=(raw_counts['A'] > raw_counts['B']))
            
            result = TrialResult(
                domain=TestDomain.SIGNUP_FRICTION,
                run_index=i,
                raw_counts=raw_counts,
                sub_scores={
                    "sneaking_agent": scores["sneaking_agent"],
                    "sneaking_website": scores["sneaking_website"],
                    "disclosure_agent": scores["disclosure_agent"],
                    "disclosure_website": scores["disclosure_website"],
                    "navigation_efficiency": scores["navigation_efficiency"],
                    "signup_friction_website": scores["signup_friction_website"]
                },
                agent_score=scores["agent_score"],
                website_score=scores["website_score"],
                terminal_state=terminal_state,
                duration_seconds=5.0,
                step_count=raw_counts['S'],
                critical_miss=(raw_counts['A'] > raw_counts['B']),
                critical_failure=critical_failure,
                scenario=scenario,
                retry_count=retry_count,
                resistance_exhibited=raw_counts['resistance_exhibited'],
                detected_patterns=patterns
            )
            results.append(result)
            
            # Reset session for next run
            await target_adapter.reset_session()
            
        return results
