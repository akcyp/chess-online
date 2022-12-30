from marshmallow import Schema, fields


class GameReadyActionSchema(Schema):
    type = fields.Str(required=True, validate=lambda s: s == 'ready')
    ready = fields.Bool(required=True)
