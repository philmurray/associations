WITH ins AS (
INSERT INTO questions(text)
VALUES ('People are basically')
RETURNING id
),
a1 as(
INSERT INTO answers(question_id, text)
SELECT ins.id, 'good'
FROM ins
)
INSERT INTO answers(question_id, text)
SELECT ins.id, 'evil'
FROM ins
