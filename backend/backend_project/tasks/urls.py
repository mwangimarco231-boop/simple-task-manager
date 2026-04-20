from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_home(request):
    return JsonResponse({"message": "API is working!", "status": "ok"})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_home),  # This handles the root /api/ URL
    # This handles /api/tasks/, /api/register/, etc.
    path('api/', include('tasks.urls')),
]
