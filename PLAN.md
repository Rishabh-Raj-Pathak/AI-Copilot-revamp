# Frontend Prototype Build Plan

## Scope

This is a frontend-only prototype.

There is no backend, no real trading, no wallet execution, no live market data and no persistent user state.

Use mock data, static JSON, local component state and simulated UI transitions.

---

## Prototype Rules

- Do not build backend APIs.
- Do not integrate real DEXs.
- Do not execute trades.
- Do not connect wallets unless already available in the app.
- Use mock trade data.
- Use mock AI recommendations.
- Use mock risk analysis.
- Use simulated loading, success and execution states.
- Prioritize visual clarity over production logic.
- Optimize for demo flow.

---

## Core Flow

These screens are required for the prototype to feel complete.

### 1. New Onboarding Overlay

**Priority:** Must build  
**Task ID:** `new_onboarding_overlay`  
**Type:** Frontend UI  
**Data Source:** Static copy  
**Purpose:** Fix first-user confusion

Build a simple onboarding overlay that explains:

- What the product does
- What the user should do first
- Why the AI Copilot exists
- What the demo flow is trying to show

Use local state to dismiss the overlay.

---

### 2. DEX Selector

**Priority:** Must build  
**Task ID:** `dex_selector`  
**Type:** Frontend UI  
**Data Source:** Static mock DEX list  
**Purpose:** Show multi-DEX support clearly

Add a selector with mock DEX options.

Example options:

- Uniswap
- Curve
- Balancer
- PancakeSwap

Changing the selected DEX should update the UI state only. No real integration is needed.

---

### 3. Guided Checklist

**Priority:** Must build  
**Task ID:** `guided_checklist`  
**Type:** Frontend UI  
**Data Source:** Static checklist config  
**Purpose:** Make the next action obvious

Create a guided checklist that shows the user where they are in the demo.

Example checklist:

- Select market
- Review AI trade setup
- Open risk receipt
- Simulate execution
- Review trade state

Checklist progress can be hardcoded or driven by local state.

---

### 4. AI Copilot Home Redesign

**Priority:** Must build  
**Task ID:** `ai_copilot_home_redesign`  
**Type:** Frontend UI  
**Data Source:** Mock recommendation data  
**Purpose:** Serve as the central demo screen

Redesign the AI Copilot home screen as the main demo hub.

It should show:

- Market summary
- AI recommendation
- Suggested trade setup
- Risk summary
- Next action CTA

No real AI is needed. Use static mock responses.

---

### 5. RWA Category Filter

**Priority:** Must build  
**Task ID:** `rwa_category_filter`  
**Type:** Frontend UI  
**Data Source:** Static categories  
**Purpose:** Show product expansion

Add a category filter that includes RWA assets.

Example categories:

- Crypto
- Stablecoins
- RWAs
- Commodities
- Treasuries

Filtering should only update visible mock cards.

---

### 6. Trade Setup Card

**Priority:** Must build  
**Task ID:** `trade_setup_card`  
**Type:** Frontend UI  
**Data Source:** Mock trade setup  
**Purpose:** Make AI recommendation tangible

Create a trade setup card with mock values.

Include:

- Asset
- Direction
- Entry range
- Target
- Stop loss
- Confidence
- Rationale
- CTA to review risk

This should feel like an AI-generated recommendation, using static data.

---

### 7. Risk Receipt Modal

**Priority:** Must build  
**Task ID:** `risk_receipt_modal`  
**Type:** Frontend UI  
**Data Source:** Mock risk data  
**Purpose:** Build trust before trade

Add a modal before simulated execution.

Include:

- Max downside
- Risk level
- Key assumptions
- What could go wrong
- Confirmation checkbox
- Simulate trade button

No real risk engine is needed.

---

### 8. Simulated Execution State

**Priority:** Must build  
**Task ID:** `simulated_execution_state`  
**Type:** Frontend UI  
**Data Source:** Local UI state  
**Purpose:** Make the demo feel complete

Create a simulated execution flow.

Example states:

- Preparing trade
- Checking route
- Confirming risk receipt
- Simulating execution
- Trade simulated successfully

Use timers, skeleton states or progress indicators. No transaction should be created.

---

## Secondary Demo Value

Build these after the core frontend flow works.

### 9. Live Trade Copilot Panel

**Priority:** Good demo value  
**Task ID:** `live_trade_copilot_panel`  
**Type:** Frontend UI  
**Data Source:** Mock live updates  
**Purpose:** Show during-trade intelligence

Add a side panel that shows mock trade monitoring.

Example messages:

- Volatility increasing
- Price moving toward target
- Stop loss unchanged
- Risk remains within plan

Use static or timed mock updates.

---

### 10. AI Journal and Process Score

**Priority:** Good demo value  
**Task ID:** `ai_journal_process_score`  
**Type:** Frontend UI  
**Data Source:** Mock journal entries  
**Purpose:** Show retention loop

Add a journal section with mock trade reflections.

Include:

- Trade summary
- Decision quality
- Process score
- What the user followed well
- What could improve

No database or persistence is needed.

---

## Post-Core Enhancements

These are optional for the prototype.

### 11. Daily Briefing

**Priority:** Add after core flow  
**Task ID:** `daily_briefing`  
**Type:** Frontend UI  
**Data Source:** Static briefing data  
**Purpose:** Show habit loop

Add a mock daily briefing screen.

Include:

- Market overview
- Top opportunity
- Risk warning
- Suggested action

---

### 12. Weekly Report and Social Proof

**Priority:** Lowest priority  
**Task ID:** `weekly_report_social_proof`  
**Type:** Frontend UI  
**Data Source:** Static report data  
**Purpose:** Add optional credibility layer

Add a mock weekly report or social proof block.

Include:

- Weekly progress
- Process score change
- Number of simulated trades reviewed
- Sample user-style proof points

---

## Cursor / AI Agent Build Spec

```yaml
project_type: frontend_prototype

backend:
  required: false
  api_integration: false
  database: false
  real_trading: false
  wallet_execution: false
  live_market_data: false

implementation_rules:
  - Use static mock data.
  - Use local component state.
  - Use simulated loading states.
  - Use fake execution progress.
  - Do not add backend dependencies.
  - Do not create API routes unless required by existing app structure.
  - Do not add real DEX integrations.
  - Do not add real AI calls.
  - Focus on demo clarity and interaction quality.

build_plan:
  - id: new_onboarding_overlay
    order: 1
    phase: core_flow
    priority: must_build
    type: frontend_ui
    data_source: static_copy
    backend_required: false
    purpose: Fix first-user confusion

  - id: dex_selector
    order: 2
    phase: core_flow
    priority: must_build
    type: frontend_ui
    data_source: static_mock_dex_list
    backend_required: false
    purpose: Show multi-DEX support clearly

  - id: guided_checklist
    order: 3
    phase: core_flow
    priority: must_build
    type: frontend_ui
    data_source: static_checklist_config
    backend_required: false
    purpose: Make the next action obvious

  - id: ai_copilot_home_redesign
    order: 4
    phase: core_flow
    priority: must_build
    type: frontend_ui
    data_source: mock_recommendation_data
    backend_required: false
    purpose: Serve as the central demo screen

  - id: rwa_category_filter
    order: 5
    phase: core_flow
    priority: must_build
    type: frontend_ui
    data_source: static_categories
    backend_required: false
    purpose: Show product expansion

  - id: trade_setup_card
    order: 6
    phase: core_flow
    priority: must_build
    type: frontend_ui
    data_source: mock_trade_setup
    backend_required: false
    purpose: Make AI recommendation tangible

  - id: risk_receipt_modal
    order: 7
    phase: core_flow
    priority: must_build
    type: frontend_ui
    data_source: mock_risk_data
    backend_required: false
    purpose: Build trust before trade

  - id: simulated_execution_state
    order: 8
    phase: core_flow
    priority: must_build
    type: frontend_ui
    data_source: local_ui_state
    backend_required: false
    purpose: Make the demo feel complete

  - id: live_trade_copilot_panel
    order: 9
    phase: secondary_demo_value
    priority: good_demo_value
    type: frontend_ui
    data_source: mock_live_updates
    backend_required: false
    purpose: Show during-trade intelligence

  - id: ai_journal_process_score
    order: 10
    phase: secondary_demo_value
    priority: good_demo_value
    type: frontend_ui
    data_source: mock_journal_entries
    backend_required: false
    purpose: Show retention loop

  - id: daily_briefing
    order: 11
    phase: post_core_enhancements
    priority: add_after_core_flow
    type: frontend_ui
    data_source: static_briefing_data
    backend_required: false
    purpose: Show habit loop

  - id: weekly_report_social_proof
    order: 12
    phase: post_core_enhancements
    priority: lowest_priority
    type: frontend_ui
    data_source: static_report_data
    backend_required: false
    purpose: Add optional credibility layer
```