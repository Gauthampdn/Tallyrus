import requests
from bs4 import BeautifulSoup
import logging
from typing import Optional, List, Dict

def scrape_website(url: str, headers: Optional[Dict[str, str]] = None) -> Optional[BeautifulSoup]:
    """
    Scrapes a website and returns its HTML content as a BeautifulSoup object.
    
    Args:
        url (str): The URL of the website to scrape
        headers (dict, optional): Custom headers for the HTTP request
        
    Returns:
        BeautifulSoup: Parsed HTML content, or None if the request fails
    """
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
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

def extract_ela_standards(soup: BeautifulSoup) -> List[Dict]:
    """
    Extracts English Language Arts standards from the given BeautifulSoup object.
    
    Args:
        soup (BeautifulSoup): Parsed HTML content
    
    Returns:
        List[Dict]: Extracted ELA standards with grade level and description
    """
    standards = []

    # Find all standard sections
    standard_sections = soup.find_all('div', style="padding-left:3px; padding-right:3px;")

    for section in standard_sections:
        # Extract the standard identifier
        standard_identifier = section.find('a')
        if standard_identifier:
            standard_identifier = standard_identifier.text.strip()
        
        # Extract grade level
        grade_section = section.find('div', class_="col-sm-12")
        grade = grade_section.find('b').text.strip() if grade_section else "N/A"

        # Extract content area and category
        content_area = ""
        category = ""

        for div in section.find_all('div', class_="col-md-6"):
            if "Content Area" in div.text:
                content_area = div.find('b').text.strip()
            if "Category" in div.text:
                category = div.find('b').text.strip()

        # Ensure it's an ELA standard
        if "English Language Arts" in content_area:
            # Extract the standard description from the pre-wrap div
            description_div = section.find('div', style="white-space: pre-wrap; ")
            description = description_div.get_text(separator=" ").strip() if description_div else "No description found."
            
            standards.append({
                "Standard Identifier": standard_identifier,
                "Grade": grade,
                "Content Area": content_area,
                "Category": category,
                "Description": description
            })
    
    return standards

# Example usage
if __name__ == "__main__":
    target_url = "https://www2.cde.ca.gov/cacs/ela?order=0&page=0&perpage=100&mingrade=0&maxgrade=12&dl=0"
    
    soup = scrape_website(target_url)
    if soup:
        ela_standards = extract_ela_standards(soup)
        
        # Print results
        for standard in ela_standards:
            print(f"Standard Identifier: {standard['Standard Identifier']}")
            print(f"Grade: {standard['Grade']}")
            print(f"Content Area: {standard['Content Area']}")
            print(f"Category: {standard['Category']}")
            print(f"Description: {standard['Description']}\n")
