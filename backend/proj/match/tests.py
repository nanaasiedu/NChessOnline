from django.test import TestCase, Client
from django.urls import reverse
import json

class MatchViews(TestCase):
    def test_list_matches_intially_return_no_matches(self):
        response = self.client.get(reverse('match:index'))

        self.assertEqual(response.status_code, 200)
        self.assertQuerysetEqual(response.json()['matches'], [])

    def test_create_and_get_match(self):
        response = self.client.post(reverse('match:index'), json.dumps({'name' : 'match-name'}), content_type="application/json")
        self.assertEqual(response.status_code, 200)
        match_id = response.json()['id']

        response = self.client.get(reverse('match:specific', args=[match_id]))

        self.assertEqual(response.status_code, 200)

        match_json = response.json()
        self.assertEqual(match_json['id'], match_id)
        self.assertEqual(match_json['name'], 'match-name')
        self.assertEqual(match_json['state'], 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -')

    def test_put_new_match_state(self):
        response = self.client.post(reverse('match:index'), json.dumps({'name' : 'match-name'}), content_type="application/json")
        match_id = response.json()['id']

        new_state = 'rnbqkbnr/pppppppp/8/8/8/P7/1PPPPPPP/RNBQKBNR b KQkq -'
        response = self.client.put(reverse('match:specific', args=[match_id]), json.dumps({'state' : new_state}), content_type="application/json")
        self.assertEqual(response.status_code, 200)

        response = self.client.get(reverse('match:specific', args=[match_id]))

        self.assertEqual(response.status_code, 200)

        match_json = response.json()
        self.assertEqual(match_json['id'], match_id)
        self.assertEqual(match_json['name'], 'match-name')
        self.assertEqual(match_json['state'], new_state)

    def test_get_match_returns_404_for_unknown_id(self):
        response = self.client.get(reverse('match:specific', args=[404]))
        self.assertEqual(response.status_code, 404)

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