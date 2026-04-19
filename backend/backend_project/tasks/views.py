from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Task
from .serializers import TaskSerializer, UserSerializer
from django.contrib.auth.models import User
import traceback


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            print(f"ERROR in perform_create: {str(e)}")
            print(traceback.format_exc())
            raise

    def create(self, request, *args, **kwargs):
        try:
            print(f"Creating task for user: {request.user}")
            print(f"Request data: {request.data}")
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"ERROR in create: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {'error': str(e), 'traceback': traceback.format_exc()},
                status=status.HTTP_400_BAD_REQUEST
            )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
