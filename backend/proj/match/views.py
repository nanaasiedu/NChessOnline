from django.http import response
from django.http.response import Http404, HttpResponse, HttpResponseNotFound
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from django.views import View
from .models import Match
import json

default_state = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -'

class IndexView(View):
    def get(self, request):
        response = JsonResponse({
            'matches' : [ {
                'id' : match.pk,
                'name' : match.name
            } for match in Match.objects.all() ]
        })

        response["Access-Control-Allow-Origin"] = "*"

        return response

    def post(self, request):
        data = json.loads(request.body)
        match = Match(name = data['name'], state = default_state)
        match.save()
        
        response = JsonResponse({
            'id' : match.pk
        })

        response["Access-Control-Allow-Origin"] = "*"

        return response

class MatchDataView(View):
    def get(self, _, id):
        try:
            match = Match.objects.get(pk = id)
        except:
            return HttpResponseNotFound()

        return JsonResponse(MatchModelToDict(match))

    def put(self, request, id):
        data = json.loads(request.body)
        newState = data['state']

        try:
            match = Match.objects.get(pk = id)
            match.state = newState
            match.save()
        except:
            return HttpResponseNotFound()

        response = HttpResponse()
        response.status_code = 200

        return response

def MatchModelToDict(match):
    return {
        'id' : match.pk,
        'name' : match.name,
        'state' : match.state
    }