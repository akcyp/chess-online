from marshmallow import Schema, fields


class GameRematchActionSchema(Schema):
    type = fields.Str(required=True, validate=lambda s: s == 'rematch')
