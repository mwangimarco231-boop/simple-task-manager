from django.contrib.auth.models import User
from .serializers import TaskSerializer, UserSerializer  # ← Added the dot here
from .models import Task
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets, generics, permissions
from django.shortcuts import render


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
