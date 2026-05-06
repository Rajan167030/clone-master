import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  author?: string;
}

/**
 * Hook to manage SEO meta tags for each page
 * Updates document title, meta descriptions, and Open Graph tags
 */
export const useSEO = ({
  title,
  description,
  keywords = '',
  ogImage = '',
  ogType = 'website',
  canonicalUrl = '',
  author = 'Founders Connect',
}: SEOProps) => {
  useEffect(() => {
    // Update page title
    document.title = `${title} | Founders Connect`;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords && keywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    if (metaKeywords && keywords) {
      metaKeywords.setAttribute('content', keywords);
    }

    // Update author
    let metaAuthor = document.querySelector('meta[name="author"]');
    if (!metaAuthor) {
      metaAuthor = document.createElement('meta');
      metaAuthor.setAttribute('name', 'author');
      document.head.appendChild(metaAuthor);
    }
    if (metaAuthor) {
      metaAuthor.setAttribute('content', author);
    }

    // Update Open Graph tags
    updateOrCreateMeta('property', 'og:title', title);
    updateOrCreateMeta('property', 'og:description', description);
    updateOrCreateMeta('property', 'og:type', ogType);
    if (ogImage) {
      updateOrCreateMeta('property', 'og:image', ogImage);
    }

    // Update Twitter Card tags
    updateOrCreateMeta('name', 'twitter:title', title);
    updateOrCreateMeta('name', 'twitter:description', description);
    if (ogImage) {
      updateOrCreateMeta('name', 'twitter:image', ogImage);
    }

    // Update canonical URL
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, author]);
};

/**
 * Helper function to update or create meta tags
 */
function updateOrCreateMeta(
  attribute: string,
  attributeValue: string,
  content: string
) {
  let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Hook to add JSON-LD structured data to the page
 */
export const useStructuredData = (data: Record<string, any>) => {
  useEffect(() => {
    // Remove existing script if present
    const existingScript = document.querySelector(
      'script[type="application/ld+json"][data-test="structured-data"]'
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Create and add new script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-test', 'structured-data');
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [data]);
};
