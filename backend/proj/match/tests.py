from django.test import TestCase, Client
from django.urls import reverse
import json

class MatchViews(TestCase):
    def test_intially_return_no_matches(self):
        response = self.client.get(reverse('match:index'))

        self.assertEqual(response.status_code, 200)
        self.assertQuerysetEqual(response.json()['matches'], [])

    def test_create_match(self):
        response = self.client.post(reverse('match:index'), json.dumps({'name' : 'match-name'}), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        match_id = response.json()['id']

        response = self.client.get(reverse('match:get', args=[match_id]))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['id'], match_id)
        self.assertEqual(response.json()['name'], 'match-name')
        self.assertEqual(response.json()['state'], 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -')
