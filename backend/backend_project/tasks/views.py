from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Task
from .serializers import TaskSerializer, UserSerializer
from django.contrib.auth.models import User
import traceback

# Task ViewSet (for CRUD operations on tasks)


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

# Register View (for creating new users) - CSRF exempt


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("RegisterView POST hit!")
        print(f"Request data: {request.data}")

        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "username": user.username,
                "email": user.email,
                "message": "User created successfully"
            }, status=status.HTTP_201_CREATED)
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
