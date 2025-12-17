// Simple and reliable PDF page count detection
export const getPDFPageCount = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function() {
            try {
                const arrayBuffer = this.result;
                const uint8Array = new Uint8Array(arrayBuffer);
                
                // Convert to text for pattern matching (safe approach)
                let pdfText = '';
                for (let i = 0; i < uint8Array.length; i++) {
                    if (uint8Array[i] >= 32 && uint8Array[i] <= 126) {
                        pdfText += String.fromCharCode(uint8Array[i]);
                    } else {
                        pdfText += ' '; // Replace non-printable with space
                    }
                }
                
                let pageCount = 0;
                
                // Method 1: Look for /Count in PDF (most reliable)
                const countMatches = pdfText.match(/\/Count\s+(\d+)/g);
                if (countMatches && countMatches.length > 0) {
                    // Get the highest count value (in case of multiple)
                    const counts = countMatches.map(match => {
                        const num = match.match(/\d+/);
                        return num ? parseInt(num[0]) : 0;
                    });
                    pageCount = Math.max(...counts);
                    console.log('Page count found using /Count method:', pageCount);
                }
                
                // Method 2: Count /Type /Page objects if Method 1 failed
                if (pageCount === 0) {
                    const pageMatches = pdfText.match(/\/Type\s*\/Page(?![a-zA-Z])/g);
                    if (pageMatches) {
                        pageCount = pageMatches.length;
                        console.log('Page count found using /Type /Page method:', pageCount);
                    }
                }
                
                // Method 3: Look for /N (page count in some PDFs)
                if (pageCount === 0) {
                    const nMatches = pdfText.match(/\/N\s+(\d+)/g);
                    if (nMatches && nMatches.length > 0) {
                        const nCounts = nMatches.map(match => {
                            const num = match.match(/\d+/);
                            return num ? parseInt(num[0]) : 0;
                        });
                        pageCount = Math.max(...nCounts);
                        console.log('Page count found using /N method:', pageCount);
                    }
                }
                
                // Method 4: Enhanced estimation if all methods fail
                if (pageCount === 0) {
                    // Check for text content indicators
                    const textIndicators = (pdfText.match(/BT|ET|Tj|TD/g) || []).length;
                    const imageIndicators = (pdfText.match(/\/Image|\/XObject/g) || []).length;
                    
                    let bytesPerPage;
                    if (textIndicators > imageIndicators * 2) {
                        // Text-heavy PDF
                        bytesPerPage = 20000; // 20KB per page
                    } else if (imageIndicators > textIndicators) {
                        // Image-heavy PDF
                        bytesPerPage = 100000; // 100KB per page
                    } else {
                        // Mixed content
                        bytesPerPage = 50000; // 50KB per page
                    }
                    
                    pageCount = Math.max(1, Math.round(file.size / bytesPerPage));
                    console.log('Page count estimated from file characteristics:', pageCount);
                }
                
                resolve(Math.max(1, pageCount));
                
            } catch (error) {
                console.error('Error parsing PDF:', error);
                // Final fallback: conservative estimation
                const estimatedPages = Math.max(1, Math.ceil(file.size / 50000)); // 50KB per page
                resolve(estimatedPages);
            }
        };
        
        reader.onerror = () => {
            // Fallback estimation
            const estimatedPages = Math.max(1, Math.ceil(file.size / 50000));
            resolve(estimatedPages);
        };
        
        reader.readAsArrayBuffer(file);
    });
};