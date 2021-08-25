from django.http.response import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from django.views import View
from .models import Match
import json

default_state = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -'

class IndexView(View):
    def get(self, request):
        return JsonResponse({
            'matches' : [ MatchModelToDict(match) for match in Match.objects.all() ]
        })

    def post(self, request):
        data = json.loads(request.body)
        match = Match(name = data['name'], state = default_state)
        match.save()
        
        return JsonResponse({
            'id' : match.pk
        })

class GetView(View):
    def get(self, request, id):
        
        match = Match.objects.get(pk = id)

        return JsonResponse(MatchModelToDict(match))

def MatchModelToDict(match):
    return {
        'id' : match.pk,
        'name' : match.name,
        'state' : match.state
    }