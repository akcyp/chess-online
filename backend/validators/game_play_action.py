from marshmallow import Schema, fields


class GamePlayActionSchema(Schema):
    type = fields.Str(required=True, validate=lambda s: s == 'play')
    color = fields.Str(required=True, validate=lambda s: s in [
                       'white', 'black', 'exit'])
