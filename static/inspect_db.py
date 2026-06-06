import database

def inspect():
    print("--- Database Content Summary ---")
    
    # 1. NCLEX Questions
    print(f"\nNCLEX Questions count: {len(database.NCLEX_QUESTIONS)}")
    if database.NCLEX_QUESTIONS:
        sample = database.NCLEX_QUESTIONS[0]
        print("Sample Question Keys:", list(sample.keys()))
        print("Sample Question:", sample.get('question')[:80] + "...")
        print("Category:", sample.get('category'))
        print("Rationale:", sample.get('rationale')[:80] + "...")
    
    # 2. Simulation Cases
    print(f"\nSimulation Cases count: {len(database.SIMULATION_CASES)}")
    for k, v in database.SIMULATION_CASES.items():
        print(f"  Case ID/Dept: '{k}'")
        print(f"    Title: {v.get('title')}")
        print(f"    Sub-steps count: {len(v.get('steps', []))}")
        if v.get('steps'):
            first_step = v['steps'][0]
            print(f"    Step 1 Keys: {list(first_step.keys())}")
            print(f"    Step 1 Description/Text: {first_step.get('text', '')[:80]}...")
            
    # 3. Critical Lab Values
    print(f"\nCritical Lab Values count: {len(database.CRITICAL_LAB_VALUES)}")
    if database.CRITICAL_LAB_VALUES:
        print("Sample Lab Value Keys:", list(database.CRITICAL_LAB_VALUES[0].keys()))
        print("Sample Lab Value:", database.CRITICAL_LAB_VALUES[0])
        
    # 4. Drug Cards
    print(f"\nDrug Cards count: {len(database.DRUG_CARDS)}")
    if database.DRUG_CARDS:
        print("Sample Drug Card Keys:", list(database.DRUG_CARDS[0].keys()))
        print("Sample Drug Card:", database.DRUG_CARDS[0])

if __name__ == "__main__":
    inspect()
