import requests
from bs4 import BeautifulSoup
import logging
import json
import time
from typing import Optional, List, Dict
import openai
import os
from concurrent.futures import ThreadPoolExecutor
import asyncio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')
USE_OPENAI = False  # Set to True when you want to use OpenAI for generating criteria

async def generate_rubric_criteria(standard_id: str, description: str) -> List[Dict]:
    """
    Uses OpenAI to generate meaningful rubric criteria for a standard.
    If OpenAI is not configured, falls back to basic scoring levels.
    
    Args:
        standard_id (str): The standard identifier
        description (str): The standard description
    
    Returns:
        List[Dict]: List of criteria with points and descriptions
    """
    if not USE_OPENAI or not openai.api_key:
        logger.info(f"Using fallback criteria for {standard_id} (OpenAI not configured)")
        return [
            {
                "point": 5,
                "description": f"Exceeds the standard - {standard_id}: Demonstrates exceptional mastery of {description}"
            },
            {
                "point": 4,
                "description": f"Meets the standard - {standard_id}: Demonstrates proficient understanding of {description}"
            },
            {
                "point": 3,
                "description": f"Approaching the standard - {standard_id}: Shows basic understanding of {description}"
            },
            {
                "point": 2,
                "description": f"Partially meets the standard - {standard_id}: Shows limited understanding of {description}"
            },
            {
                "point": 1,
                "description": f"Does not meet the standard - {standard_id}: Shows minimal understanding of {description}"
            }
        ]

    try:
        logger.info(f"Generating rubric criteria for standard {standard_id}")
        prompt = f"""
        Create a 5-point scoring rubric for the following educational standard:
        Standard ID: {standard_id}
        Description: {description}

        Format the rubric criteria as a JSON array with 5 objects, where each object has:
        - "point": score from 5 (highest) to 1 (lowest)
        - "description": detailed description of what performance at this level looks like

        The descriptions should:
        - Be specific to this standard's content
        - Show clear progression between levels
        - Include concrete examples or indicators
        - Use educational assessment language
        """

        response = await openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert in educational assessment and rubric design."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        criteria = json.loads(response.choices[0].message.content)
        logger.info(f"Successfully generated criteria for {standard_id}")
        return criteria

    except Exception as e:
        logger.error(f"Error generating rubric criteria for {standard_id}: {str(e)}")
        return generate_rubric_criteria(standard_id, description)  # Use fallback criteria

def scrape_website(url: str, headers: Optional[Dict[str, str]] = None) -> Optional[BeautifulSoup]:
    """
    Scrapes a website and returns its HTML content as a BeautifulSoup object.
    
    Args:
        url (str): The URL of the website to scrape
        headers (dict, optional): Custom headers for the HTTP request
        
    Returns:
        BeautifulSoup: Parsed HTML content, or None if the request fails
    """
    if headers is None:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        logger.info(f"Successfully scraped {url}")
        
        return soup
        
    except requests.RequestException as e:
        logger.error(f"Error scraping {url}: {str(e)}")
        return None

def extract_grade_from_id(standard_id: str) -> str:
    """
    Extracts grade level from standard ID (e.g., 'L.K.1' -> 'K', 'L.1.1' -> '1')
    """
    parts = standard_id.split('.')
    if len(parts) >= 2:
        grade = parts[1]
        # Convert grade level to a consistent format
        if grade == 'K':
            return 'Kindergarten'
        return f'Grade {grade}'
    return None

def extract_ela_standards(soup: BeautifulSoup) -> Dict:
    """
    Extracts English Language Arts standards from the given BeautifulSoup object and formats them as a rubric template.
    """
    # Initialize the template structure
    template = {
        "Template": "California ELA Standards",
        "values": []
    }

    # Find all standard sections - they are in divs with specific padding style
    standard_sections = soup.find_all('div', style="padding-left:3px; padding-right:3px;")
    logger.info(f"Found {len(standard_sections)} standard sections")
    
    # Track categories to group standards
    categories = {}

    async def process_standard(section):
        try:
            # Extract standard identifier
            standard_id_elem = section.find('h4').find('a')
            if not standard_id_elem:
                logger.warning("No standard identifier found")
                return None
            
            standard_id = standard_id_elem.get_text(strip=True)

            # Extract grade level from standard ID
            grade_text = extract_grade_from_id(standard_id)
            if not grade_text:
                logger.warning(f"Could not extract grade level from standard ID: {standard_id}")
                return None

            # Extract content area and category
            content_divs = section.find_all('div', class_='col-md-6')
            content_area = ""
            category = ""
            
            for div in content_divs:
                text = div.find('b').get_text(strip=True) if div.find('b') else ""
                if "English Language Arts" in text:
                    content_area = text
                else:
                    category = text

            # Determine category from standard ID if not found in HTML
            if not category:
                prefix = standard_id.split('.')[0]
                category_map = {
                    'RL': 'Reading Literature',
                    'RI': 'Reading Informational Text',
                    'RF': 'Reading Foundations',
                    'W': 'Writing',
                    'SL': 'Speaking and Listening',
                    'L': 'Language'
                }
                category = category_map.get(prefix, 'General ELA')

            # Only process ELA standards
            if not any(prefix in standard_id for prefix in ['RL', 'RI', 'RF', 'W', 'SL', 'L']):
                logger.debug(f"Skipping non-ELA standard {standard_id}")
                return None

            # Extract the standard description
            desc_div = section.find('div', style="white-space: pre-wrap;")
            if not desc_div:
                logger.warning(f"No description found for standard {standard_id}")
                return None

            # Process the description text
            description = desc_div.get_text(separator=" ", strip=True)
            
            # Create category key
            category_key = f"{grade_text} - {category}"
            
            if category_key not in categories:
                categories[category_key] = {
                    "name": category_key,
                    "Criteria": []
                }

            # For testing purposes, use fallback criteria instead of OpenAI
            criteria = [
                {
                    "point": 5,
                    "description": f"Exceeds the standard - {standard_id}: Demonstrates exceptional mastery of {description}"
                },
                {
                    "point": 4,
                    "description": f"Meets the standard - {standard_id}: Demonstrates proficient understanding of {description}"
                },
                {
                    "point": 3,
                    "description": f"Approaching the standard - {standard_id}: Shows basic understanding of {description}"
                },
                {
                    "point": 2,
                    "description": f"Partially meets the standard - {standard_id}: Shows limited understanding of {description}"
                },
                {
                    "point": 1,
                    "description": f"Does not meet the standard - {standard_id}: Shows minimal understanding of {description}"
                }
            ]
            
            # Uncomment this section when ready to use OpenAI
            # criteria = await generate_rubric_criteria(standard_id, description)
            
            if criteria:
                categories[category_key]["Criteria"].extend(criteria)
                logger.info(f"Added criteria for standard {standard_id} to {category_key}")
            else:
                logger.error(f"Failed to generate criteria for standard {standard_id}")

        except Exception as e:
            logger.error(f"Error processing standard: {str(e)}")
            return None

    # Process standards concurrently
    async def process_all_standards():
        try:
            tasks = [process_standard(section) for section in standard_sections]
            await asyncio.gather(*[task for task in tasks if task is not None])
            logger.info(f"Processed {len(categories)} categories")
        except Exception as e:
            logger.error(f"Error in process_all_standards: {str(e)}")

    # Run the async processing
    try:
        asyncio.run(process_all_standards())
        logger.info("Completed async processing")
    except Exception as e:
        logger.error(f"Error running async processing: {str(e)}")

    # Add all categories to the template values
    template["values"] = list(categories.values())
    logger.info(f"Final template has {len(template['values'])} categories")
    
    return template

def get_total_pages(soup: BeautifulSoup) -> int:
    """
    Extracts the total number of pages from the pagination information.
    
    Args:
        soup (BeautifulSoup): Parsed HTML content
    
    Returns:
        int: Total number of pages or 1 if not found
    """
    try:
        # Look for pagination information
        pagination_info = soup.find('div', class_='col-md-4 text-right')
        if pagination_info:
            # Extract text like "Page 1 of 5"
            page_text = pagination_info.text.strip()
            if "of" in page_text:
                total_pages = int(page_text.split("of")[-1].strip())
                return total_pages
    except Exception as e:
        logger.error(f"Error extracting pagination information: {str(e)}")
    
    # Default to 1 page if we can't determine the total
    return 1

def scrape_all_pages(base_url: str, per_page: int = 100) -> Dict:
    """
    Scrapes all pages of standards and combines the results.
    
    Args:
        base_url (str): Base URL for the first page
        per_page (int): Number of items per page
    
    Returns:
        Dict: Combined standards in rubric template format
    """
    template = None
    page = 0
    
    # Scrape the first page
    first_url = f"{base_url}&page={page}&perpage={per_page}"
    soup = scrape_website(first_url)
    
    if not soup:
        logger.error("Failed to scrape the first page. Exiting.")
        return {"Template": "California ELA Standards", "values": []}
    
    # Get standards from the first page
    template = extract_ela_standards(soup)
    logger.info(f"Scraped page {page+1}")
    
    # Get total number of pages
    total_pages = get_total_pages(soup)
    logger.info(f"Found {total_pages} total pages to scrape")
    
    # Scrape remaining pages
    for page in range(1, total_pages):
        # Construct URL for this page
        page_url = f"{base_url}&page={page}&perpage={per_page}"
        
        # Add a short delay to be respectful to the server
        time.sleep(1)
        
        # Scrape the page
        soup = scrape_website(page_url)
        if soup:
            page_template = extract_ela_standards(soup)
            # Merge the values from this page into the main template
            template["values"].extend(page_template["values"])
            logger.info(f"Scraped page {page+1}")
        else:
            logger.error(f"Failed to scrape page {page+1}")
    
    return template

def save_to_json(standards: Dict, output_file: str = "ela_standards.json") -> None:
    """
    Saves the extracted standards to a JSON file in the rubric template format.
    
    Args:
        standards (Dict): Standards formatted as a rubric template
        output_file (str): Name of the output JSON file
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(standards, f, indent=2, ensure_ascii=False)
        logger.info(f"Successfully saved rubric template with {len(standards['values'])} categories to {output_file}")
    except Exception as e:
        logger.error(f"Error saving standards to JSON: {str(e)}")

if __name__ == "__main__":
    try:
        # Check if OpenAI should be used
        if USE_OPENAI:
            if not openai.api_key:
                logger.warning("OpenAI API key not found. Using fallback criteria generation.")
                logger.warning("To use OpenAI, set the OPENAI_API_KEY environment variable and USE_OPENAI=True")
            else:
                logger.info("OpenAI integration enabled")
        else:
            logger.info("Using fallback criteria generation (OpenAI disabled)")

        # Base URL without page and perpage parameters
        base_url = "https://www2.cde.ca.gov/cacs/ela?order=0&page=0&perpage=100&mingrade=0&maxgrade=12&dl=0"
        
        # Scrape all pages
        logger.info("Starting scraping process")
        all_standards = scrape_all_pages(base_url)
        
        # Save to JSON file
        if all_standards and all_standards["values"]:
            save_to_json(all_standards)
            print(f"\nScraping complete! Found {len(all_standards['values'])} categories.")
            print(f"Results saved to ela_standards.json")
        else:
            logger.error("No standards were collected or processing failed")
            print("\nError: No standards were collected. Check the logs for details.")
            
    except Exception as e:
        logger.error(f"Main process error: {str(e)}")
        print(f"\nError: {str(e)}")