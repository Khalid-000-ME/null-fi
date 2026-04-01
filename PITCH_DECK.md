# null402: Pitch Deck & Selling Strategy

*If constructing a presentation (PPT) for hackathons, investors, or judges, follow this proven structural narrative:*

**Perfect Taglines:**  
* "Agentic Confidential Lending via Zama fhEVM."
* "Your position is not hidden. It is null."
* "Confidentiality by Design. Solvency by Math."

### Slide Outline

**Slide 1: Title & Hook**
*   **Title:** null402: Agentic Confidential Lending
*   **Tagline:** Your collateral. Your debt. Your health factor. All null to everyone else.
*   **Visual:** The brutalist null402 ASCII wave or yellow `[encrypted]` badge.

**Slide 2: The Problem (The DeFi Panopticon)**
*   **Point 1:** DeFi lending is completely transparent. Aave, Compound, and Morpho broadcast exact user liquidation thresholds to the world.
*   **Point 2:** MEV bots and predators use this public state to aggressively target vulnerable positions, sweeping users exactly at the wire.
*   **Point 3:** Smart contracts today force the user to compromise their privacy for basic financial solvency.

**Slide 3: The Solution (null402)**
*   **Point 1:** Introduces **null402**, where core protocol solvency is managed through Fully Homomorphic Encryption (FHE) natively via Zama fhEVM.
*   **Point 2:** Your debt tokens (nUSDC) and collateral wrapped tokens (nETH) store values as mathematically verifiable ciphertext.
*   **Point 3:** Liquidators can only ask an Oracle a yes/no question without ever seeing the quantities inside.

**Slide 4: The UX Revolution (Agentic AI)**
*   **Concept:** Navigating encrypted transactions and complex DApp UIs is historically painful. null402 solves this through a dedicated **LLM Agent**.
*   **Action:** Users say *"Borrow 100 nUSDC against my nETH"* — the AI translates intent, structures the `FHE.select()` payload, and prompts the user's wallet for an EIP-712 permissioned signature. No cryptic hexadecimal padding required.

**Slide 5: Architecture & How It Works**
*   **Flow:** 
    1. User delegates intent to null402 Agent. 
    2. Agent queries `NullPool.sol`. 
    3. Solvency formula `FHE.ge(collateral × LTV, debt)` computes on ciphertexts. 
    4. Zama Gateway decrypts *only the boolean result* (`true`/`false`).
*   **Technical Merit:** We built custom Oracles and confidential tokens to entirely abstract the complexity away from both the end user and liquidators.

**Slide 6: Conclusion / Future Vision**
*   **Next Steps:** Scaling across L2 rollups, introducing multi-collateral backing, and allowing algorithmic liquidators to operate entirely blind.
