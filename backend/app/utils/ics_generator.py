"""ICS Calendar Export Utility."""
from datetime import datetime, timedelta
from typing import Dict, List


def generate_ics_file(
    semester_plan: Dict[str, List[str]], 
    start_date: datetime = None,
    semester_weeks: int = 16
) -> str:
    """
    Generate an ICS calendar file for the degree plan.
    
    Each semester is represented as an all-day event spanning the semester period.
    """
    if start_date is None:
        # Default to next Fall semester (August 25)
        now = datetime.now()
        year = now.year if now.month < 8 else now.year + 1
        start_date = datetime(year, 8, 25)
    
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DegreePlannerAgent//AI-Powered//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Degree Plan",
    ]
    
    current_date = start_date
    
    for semester, courses in semester_plan.items():
        # Create semester start event
        semester_end = current_date + timedelta(weeks=semester_weeks)
        
        # Format semester name nicely
        sem_num = semester.replace("semester_", "Semester ")
        
        lines.extend([
            "BEGIN:VEVENT",
            f"DTSTART;VALUE=DATE:{current_date.strftime('%Y%m%d')}",
            f"DTEND;VALUE=DATE:{semester_end.strftime('%Y%m%d')}",
            f"SUMMARY:{sem_num} - {len(courses)} Courses",
            f"DESCRIPTION:Courses: {', '.join(courses)}",
            f"UID:{semester}-{current_date.strftime('%Y%m%d')}@degreeplanner",
            "STATUS:CONFIRMED",
            "END:VEVENT",
        ])
        
        # Move to next semester (with 2 week break)
        current_date = semester_end + timedelta(weeks=2)
    
    lines.append("END:VCALENDAR")
    
    return "\r\n".join(lines)


def generate_course_events(
    semester: str,
    courses: List[str],
    semester_start: datetime,
    semester_weeks: int = 16
) -> str:
    """Generate individual course events (for more detailed calendar)."""
    lines = []
    
    for i, course in enumerate(courses):
        # Create weekly recurring event for each course
        # Spread courses across weekdays
        day_offset = i % 5  # Mon-Fri
        course_date = semester_start + timedelta(days=day_offset)
        
        lines.extend([
            "BEGIN:VEVENT",
            f"DTSTART:{course_date.strftime('%Y%m%d')}T090000",
            f"DTEND:{course_date.strftime('%Y%m%d')}T110000",
            f"SUMMARY:{course}",
            f"DESCRIPTION:Course in {semester}",
            f"RRULE:FREQ=WEEKLY;COUNT={semester_weeks}",
            f"UID:{course}-{semester}@degreeplanner",
            "END:VEVENT",
        ])
    
    return "\r\n".join(lines)
