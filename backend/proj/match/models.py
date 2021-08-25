from django.db import models

class Match(models.Model):
    name = models.CharField(max_length=100)
    state = models.TextField(max_length=100)

    def __str__(self) -> str:
        return f"{self.name} - {self.state}"
