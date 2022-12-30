from marshmallow import Schema, fields


class GameOfferDrawActionSchema(Schema):
    type = fields.Str(required=True, validate=lambda s: s == 'offerdraw')
