from marshmallow import Schema, fields


class GameResignActionSchema(Schema):
    type = fields.Str(required=True, validate=lambda s: s == 'resign')
