from marshmallow import Schema, fields


def validate_position(s: str):
    return len(s) == 2 and s[0].lower() in [chr(i) for i in range(ord('a'), ord('i'))] and s[1] in ['1', '2', '3', '4', '5', '6', '7', '8']


class GameMoveActionSchema(Schema):
    type = fields.Str(required=True, validate=lambda s: s == 'move')
    from_ = fields.Str(data_key='from', required=True,
                       validate=validate_position)
    to = fields.Str(required=True, validate=validate_position)
    promotion = fields.Str(validate=lambda s: s in ['q', 'n', 'b', 'p'])
