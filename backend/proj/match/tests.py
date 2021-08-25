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

        match_json = response.json()
        self.assertEqual(match_json['id'], match_id)
        self.assertEqual(match_json['name'], 'match-name')
        self.assertEqual(match_json['state'], 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -')

    def test_list_matches(self):
        response = self.client.post(reverse('match:index'), json.dumps({'name' : 'match 1'}), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        match_1_id = response.json()['id']

        response = self.client.post(reverse('match:index'), json.dumps({'name' : 'match 2'}), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        match_2_id = response.json()['id']

        response = self.client.get(reverse('match:index'))

        self.assertEqual(response.status_code, 200)

        matches_json = response.json()['matches']
        self.assertEqual(len(matches_json), 2) 

        self.assertEqual(matches_json[0]['id'], match_1_id)
        self.assertEqual(matches_json[0]['name'], 'match 1')

        self.assertEqual(matches_json[1]['id'], match_2_id)
        self.assertEqual(matches_json[1]['name'], 'match 2')