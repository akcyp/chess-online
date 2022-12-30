from marshmallow import Schema, fields


class CreateGameActionSchema(Schema):
    type = fields.Str(required=True, validate=lambda s: s == 'createGame')
    minutes = fields.Int(required=True, validate=lambda n: n in minutes_steps)
    increment = fields.Int(
        required=True, validate=lambda n: n in increment_steps)
    private = fields.Bool(required=True)


minutes_steps = [
    *[0.25 * (i + 1) for i in range(7)],
    *[i + 2 for i in range(19)],
    *[25 + i * 5 for i in range(5)],
    *[60 + i * 15 for i in range(9)],
]
increment_steps = [
    *[i for i in range(21)],
    *[25 + i * 5 for i in range(5)],
    *[60 + i * 30 for i in range(5)],
]
