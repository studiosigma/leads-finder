try:
    from celery import Celery
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    celery_app = Celery(
        "leads_finder",
        broker=redis_url,
        backend=redis_url,
        include=["app.services.scrapers.tasks"]
    )
except ImportError:
    class MockTask:
        def __call__(self, *args, **kwargs): pass
        def delay(self, *args, **kwargs): pass
    class MockCelery:
        def task(self, *args, **kwargs): return lambda f: f
        class conf:
            @staticmethod
            def update(*args, **kwargs): pass
    celery_app = MockCelery()

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
