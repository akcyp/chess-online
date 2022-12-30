import random
from typing import List

alphabet = '123456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'


def get_random_string(length=6):
    # Use a list comprehension to generate a list of random characters
    # from the alphabet string
    characters = [random.choice(alphabet) for _ in range(length)]
    # Join the characters into a single string and return it
    return ''.join(characters)


def get_unique_room_id(ignore_ids: List[str]) -> str:
    while True:
        # Generate a random string using the get_random_string function
        id = get_random_string()
        # If the generated string is not in the except list, return it
        if id not in ignore_ids:
            return id
