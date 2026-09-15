import json
from typing import List
from app.llm_gateway.gateway import llm_gateway
from app.models.schemas import (
    MCQGenerateRequest,
    MCQGenerateResponse,
    MCQQuestion,
    BloomLevel,
    LLMRequest,
)


MCQ_SYSTEM_PROMPT = """You are an expert assessment designer for India's government officials.
Generate multiple-choice questions (MCQs) that test competency at a specific proficiency level.

Rules:
1. Each question must have exactly 4 options (A, B, C, D)
2. One option must be clearly correct
3. Questions should match Bloom's taxonomy level specified
4. Include an explanation for the correct answer
5. Include a rationale explaining WHY this question tests the competency
6. Questions should be realistic and relevant to Indian government statistical operations

Output format: JSON array of objects with fields:
- question: the question text
- options: array of 4 strings
- correct_answer: index (0-3) of correct option
- explanation: why the correct answer is right
- rationale: WHY this question tests the competency at this level"""


async def generate_mcqs(request: MCQGenerateRequest) -> MCQGenerateResponse:
    """Generate MCQs for a given competency and level from uploaded document context."""

    prompt = f"""Generate {request.num_questions} MCQ questions for:
- Competency ID: {request.competency_id}
- Target Level: {request.target_level} (1=Unaware, 2=Aware, 3=Applies with guidance, 4=Independent, 5=Expert)
- Bloom's Level: {request.bloom_level.value}
- Source Document ID: {request.source_document_id}

Generate questions that test whether someone at level {request.target_level - 1} can demonstrate level {request.target_level} competency.
Output as JSON array."""

    llm_response = await llm_gateway.generate(
        LLMRequest(
            prompt=prompt,
            system_prompt=MCQ_SYSTEM_PROMPT,
            max_tokens=4096,
            temperature=0.7,
        )
    )

    try:
        questions_data = json.loads(llm_response.content)
    except json.JSONDecodeError:
        # Try to extract JSON from the response
        import re
        json_match = re.search(r'\[.*\]', llm_response.content, re.DOTALL)
        if json_match:
            questions_data = json.loads(json_match.group())
        else:
            raise ValueError("LLM response could not be parsed as JSON")

    questions = []
    for q in questions_data:
        questions.append(
            MCQQuestion(
                question=q["question"],
                options=q["options"],
                correct_answer=q["correct_answer"],
                explanation=q["explanation"],
                bloom_level=request.bloom_level,
                competency_id=request.competency_id,
                target_level=request.target_level,
                source_document_chunk_id=None,
                rationale=q.get("rationale", "Generated from uploaded document context"),
            )
        )

    return MCQGenerateResponse(
        questions=questions,
        rationale=f"Generated {len(questions)} MCQs for competency {request.competency_id} at level {request.target_level} using Bloom's {request.bloom_level.value}",
    )
