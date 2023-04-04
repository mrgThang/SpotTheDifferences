from django.db import models

class InputValue(models.Model):
    index = models.IntegerField()
    value = models.IntegerField()

    def __str__(self):
        return "{}:{}..".format(self.index, self.value)

class OutputValue(models.Model):
    index = models.IntegerField()
    value = models.IntegerField()

    def __str__(self):
        return "{}:{}..".format(self.index, self.value)
