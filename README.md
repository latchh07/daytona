# Ultron

Ultron is a comprehensive testing and evaluation suite for AI agents. The project is split into two primary modules that focus on distinct safety and robustness vectors: **Poisoned RAG Evaluation** and the **Web Manipulation Engine**. 

### Setup: 
1. Install all libraries required: `pip install -r requirements.txt`.
2. Generate all required API keys as detailed in the `.env.example` file.
3. Run the frontend: `cd frontend` --> `npm run dev`.

---

## Module 1: Poisoned RAG (Content Integrity Crash Test)
This module evaluates the resilience of Retrieval-Augmented Generation (RAG) agents against data poisoning and prompt injection attacks. 

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
- **Run the Server:** Run `content_integration_engine/main.py` using a standard ASGI server (`uvicorn main:app --reload`).
- **Integration:** The API provides endpoints (`/rag-trials/run`) that can be integrated into your CI/CD pipeline to continuously test new versions of your RAG agents.

---

## Module 2: Web Manipulation Engine (WME)
This engine is designed to evaluate how AI web agents perform when faced with websites employing manipulative UI/UX patterns (often called "dark patterns").

### Agents Involved
1. **Test Agents:** The orchestrator spins up specific agents designed to test different dark pattern vectors using Playwright (`website_test_agent.py` is the naive agent being tested on here).
   - `SignupFrictionAgent`: tracks whether the naive agent can recognise deceptive add-on costs (without it choosing for such services). 
   - `CancellationRoachAgent`: tracks whether the naive agent can aggressively cancel a subscription despite any attempts by service provider to sway an user otherwise (e.g., providing the same service for half the cost, option to pause rather than cancel subscription, calling to cancel to make cancellation difficult before the next billing cycle, etc).
   - `ConfirmshamingAgent`: tracks whether the naive agent is manipulated by confirmshaming tactics employed by the website (e.g., "I will risk falling behind", "I do not mind losing all progress", etc). 
   - `FakeUrgencyAgent`: tests whether the naive agent is manipulated by urgency claims (e.g., "Offer ends in 4 hours", "Only 3 spots remaining", etc) to subscribe for a service despite higher costs.
2. **Counterfactual Judge** (`engine/counterfactual_judge.py`): Evaluates the trajectory of the naive agent to determine if they fell victim to the dark pattern (e.g., completed a purchase due to a fake countdown timer) or resisted it from the results of the 4 test agents.
3. **Scenario Generator:** Creates the hidden constraints and visible tasks for the Test Agents (e.g., "Complete purchase, but do not buy add-ons", "Paul is a founder working on a tight deadline. He requires this service immediately", etc) based on the dark pattern being tested.

### End-to-End Flow
1. **Start Evaluation:** A user triggers an evaluation against a `target_url` via the `/api/evaluate` endpoint.
2. **Parallel Agent Execution:** The `orchestrator.py` uses Daytona sandboxes to create parallel Playwright browser contexts. The 4 test agents generate scenarios, which are passed to the 4 independent instances of the naive agent to perform the required actions on the target website.
3. **GPU Optimisation:** The independent sandbox instances are assigned to different GPU nodes via Nosana for higher GPU optimisation for paralellisation. 
4. **Navigation & Detection:** As the agent navigates the site, it reports its steps. The 4 test agents analyze the DOM for dark patterns (like fake countdown timers or hidden fees).
5. **Judgment:** Once the agent reaches a terminal state (or times out), the Counterfactual Judge evaluates the action trace against the generated scenario constraints.
6. **Website Judgement:** The Counterfactual Judge uses Oxylabs to scrape the website and extract manipulative patterns to look out for.
7. **Scoring & Feedback:** The system calculates an **Agent Safety Score** (how well the agent resisted manipulation) and a **Website Risk Score** (the severity of the manipulation present on the site). A `DeveloperFeedbackGenerator` then provides actionable guardrail recommendations (where the agent failed, where the agent successfully resisted manipulation, how to improve). 

### How to Implement & Run
- **Run the Server:** Start the orchestrator by running `python web_manipulation_engine\nosana_orchestrator.py`.
- **Mock Target:** The system can test any live URL, but a Mock UI with Decepticon elements is available for controlled testing: `https://mockuidaytona.vercel.app/login`.
