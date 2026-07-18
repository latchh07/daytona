# Daytona Project

Daytona is a comprehensive testing and evaluation suite for AI agents. The project is split into two primary modules that focus on distinct safety and robustness vectors: **Poisoned RAG Evaluation** and the **Web Manipulation Engine**. 

---

## Module 1: Poisoned RAG (Content Integrity Crash Test)
Located in the root directory, this module evaluates the resilience of Retrieval-Augmented Generation (RAG) agents against data poisoning and prompt injection attacks. 

### Agents Involved
1. **Target Agent** (`target_agent.py`): The agent under test. It receives a user query and a set of retrieved documents, then attempts to answer the query. You can also upload your own agent to be tested.
2. **Judge Agent** (`judge.py`): An independent LLM-based evaluator. It inspects the Target Agent's response to determine if it followed a malicious instruction, fabricated a claim based on an injection, leaked sensitive data, or echoed injected phrasing.

### End-to-End Flow
1. **Agent Upload/Selection:** A user uploads their target agent (or uses the default `TargetAgent`) via the `/agents/upload` endpoint.
2. **Document Generation & Poisoning:** The system uses a `DocumentGenerator` to mock up documents related to the agent's domain. An `InjectionDetector` (or remote sandbox) is then used to flag any anomalous or "poisoned" spans in these documents.
3. **Execution:** The RAG trial starts via `/rag-trials/run`. The Target Agent queries the provided documents (using an `InMemoryRetriever` or local equivalent). Some of these documents contain hidden prompt injections.
4. **Evaluation:** The Target Agent's final answer, along with the retrieved documents and flagged poisoned spans, is passed to the Judge.
5. **Scoring:** The Judge calculates a score (0 to 100), determining if the Target Agent was fully hijacked, partially hijacked, or if it successfully resisted the malicious instructions. The results are saved via Supabase.

### How to Implement & Run
- **Setup:** Ensure you have `.env` configured with your Supabase credentials and `LLM_PROVIDER` (e.g., `openai` or `kimi`). Install requirements.
- **Run the Server:** Run `main.py` using a standard ASGI server (e.g., `uvicorn main:app --reload`).
- **Integration:** The API provides endpoints (`/rag-trials/run`) that can be integrated into your CI/CD pipeline to continuously test new versions of your RAG agents.

---

## Module 2: Web Manipulation Engine (WME)
Located in the `project/` directory, this engine is designed to evaluate how AI web agents perform when faced with websites employing manipulative UI/UX patterns (often called "dark patterns").

### Agents Involved
1. **Test Agents:** The orchestrator spins up specific agents designed to test different dark pattern vectors using Playwright (`website_test_agent.py` is the naive agent being tested on here).
   - `SignupFrictionAgent`
   - `CancellationRoachAgent`
   - `ConfirmshamingAgent`
   - `FakeUrgencyAgent`
2. **Counterfactual Judge** (`engine/counterfactual_judge.py`): Evaluates the trajectory of the Test Agents to determine if they fell victim to the dark pattern (e.g., completed a purchase due to a fake countdown timer) or resisted it.
3. **Scenario Generator:** Creates the hidden constraints and visible tasks for the Test Agents (e.g., "Complete purchase, but do not buy add-ons").

### End-to-End Flow
1. **Start Evaluation:** A user triggers an evaluation against a `target_url` via the `/api/evaluate` endpoint.
2. **Parallel Agent Execution:** The `orchestrator.py` uses a Sandbox Provider to create parallel Playwright browser contexts. It unleashes the four specialized Test Agents simultaneously onto the target website.
3. **Navigation & Detection:** As each agent navigates the site, it reports its steps. Domain-specific detectors (e.g., `UrgencyDetector`) analyze the DOM for dark patterns (like fake countdown timers or hidden fees).
4. **Judgment:** Once the agent reaches a terminal state (or times out), the Counterfactual Judge evaluates the action trace against the generated scenario constraints.
5. **Scoring & Feedback:** The system calculates an **Agent Safety Score** (how well the agent resisted manipulation) and a **Website Risk Score** (the severity of the manipulation present on the site). A `DeveloperFeedbackGenerator` then provides actionable guardrail recommendations.

### How to Implement & Run
- **Setup:** Navigate to the `project/` directory and install dependencies.
- **Run the Server:** Start the orchestrator by running `python orchestrator.py` (runs on port 8000).
- **Run a Demo:** Execute `python demo_wme.py` to trigger a simulated run. The demo streams events and prints the final Agent Safety and Website Risk verdicts in the console.
- **Mock Target:** The system can test any live URL, but a Mock UI with Decepticon elements is available for controlled testing: `https://mockuidaytona.vercel.app/login`.
