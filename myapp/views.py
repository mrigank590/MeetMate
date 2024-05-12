from django.http import JsonResponse
from .speech import record_audio
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def ai_endpoint(request):
    if request.method == "POST":
        recognized_text = record_audio()
        # Return the recognized text as a JSON response
        return JsonResponse({"recognized_text": recognized_text})

    else:
        return JsonResponse({"error": "Invalid request method"}, status=400)
