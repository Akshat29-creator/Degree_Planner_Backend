import math
from datetime import datetime, timedelta, timezone

def percentage_to_quality(percentage: float) -> int:
    """
    Map score percentage (0-100) to SM-2 quality (0-5)
    
    5: perfect response (>= 90%)
    4: correct response after a hesitation (>= 80%)
    3: correct response recalled with serious difficulty (>= 60%)
    2: incorrect response; where the correct one seemed easy to recall (>= 40%)
    1: incorrect response; the correct one remembered (>= 20%)
    0: complete blackout (< 20%)
    """
    if percentage >= 90:
        return 5
    elif percentage >= 80:
        return 4
    elif percentage >= 60:
        return 3
    elif percentage >= 40:
        return 2
    elif percentage >= 20:
        return 1
    else:
        return 0


def calculate_sm2(
    quality: int, 
    prev_interval: int, 
    prev_repetitions: int, 
    prev_ease_factor: float
) -> tuple[int, int, float]:
    """
    Standard SM-2 algorithm:
    quality: 0 to 5 score
    prev_interval: previous interval in days
    prev_repetitions: previous number of repetitions
    prev_ease_factor: previous ease factor

    Returns: (new_interval, new_repetitions, new_ease_factor)
    """
    # Enforce quality bounds
    quality = max(0, min(5, quality))
    
    # Calculate Ease Factor (EF)
    # EF' := EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_ease_factor = prev_ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if new_ease_factor < 1.3:
        new_ease_factor = 1.3
        
    if quality >= 3:
        if prev_repetitions == 0:
            new_interval = 1
        elif prev_repetitions == 1:
            new_interval = 6
        else:
            new_interval = math.ceil(prev_interval * new_ease_factor)
        new_repetitions = prev_repetitions + 1
    else:
        new_repetitions = 0
        new_interval = 1
        
    return new_interval, new_repetitions, new_ease_factor
