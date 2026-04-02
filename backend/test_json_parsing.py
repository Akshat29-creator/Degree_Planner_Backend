from app.services.ollama_service import ollama_service

test_responses = [
    # Case 1: Standard JSON
    '{"test": 1}',
    # Case 2: Thinking tags then JSON
    '<think>I should return test 2</think> {"test": 2}',
    # Case 3: Thinking with nested braces then JSON
    'Thinking... maybe { a: 1 }? Nah. <think> { internal: 0 } </think> {"test": 3}',
    # Case 4: JSON inside markdown fences
    '```json\n{"test": 4}\n```'
]

for i, res in enumerate(test_responses):
    parsed = ollama_service._extract_json(res)
    print(f"Test {i+1}: {parsed}")
