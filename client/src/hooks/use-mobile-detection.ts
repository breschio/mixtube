
import { useState, useEffect } from 'react';

interface MobileDetectionResult {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsMultipleVideos: boolean;
}

export function useMobileDetection(): MobileDetectionResult {
  const [state, setState] = useState<MobileDetectionResult>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    supportsMultipleVideos: true
  });

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    
    // Mobile Safari (particularly iOS) often restricts multiple videos playing at once
    const potentialVideoIssues = isIOS || isMobile;
    
    // Set the detected state
    setState({
      isMobile,
      isIOS,
      isAndroid,
      // Assume multiple videos are problematic on iOS and some mobile browsers
      supportsMultipleVideos: !potentialVideoIssues
    });

    // Perform a quick test to see if the browser allows multiple videos
    if (isMobile) {
      // Create two silent video elements as a test
      const testVideo1 = document.createElement('video');
      const testVideo2 = document.createElement('video');
      
      // Set properties to minimize visibility
      [testVideo1, testVideo2].forEach(vid => {
        vid.setAttribute('playsinline', '');
        vid.muted = true;
        vid.volume = 0;
        vid.style.position = 'absolute';
        vid.style.width = '1px';
        vid.style.height = '1px';
        vid.style.opacity = '0.01';
        document.body.appendChild(vid);
      });
      
      // Set a blank source (just to have something)
      testVideo1.src = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAu1tZGF0AAACrQYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAABUHZYiEAD//vSj+BTK4Y8ZMO28fVJmQ8hP1r/AchIgePJQxPFQrwr/+T49v5/aTl8YDmUvH4gOipqYVh+X3fBfTyuT4aeujR7jEIjnH8Er+AiWa1qYTJnU5YKd5GAcJCWWHsH/vIQBYCbxvFQx3GN2Wd3h81XWr/ANqvaHB0jA/VF9WYS4JOa9bpVh8esaNi/j9dVUyTq2QIL8vQ6eMjz2aqwPH82PZjUGoNtAYBsmX5rV5hlizlGtPKbg/A4vvQcLmTR205de6ySMzOlqG/bb4FU/ZpzL+RJ83z+fF9Bz+iwuLi0x/VNZ657IK';
      testVideo2.src = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAu1tZGF0AAACrQYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAABUHZYiEAD//vSj+BTK4Y8ZMO28fVJmQ8hP1r/AchIgePJQxPFQrwr/+T49v5/aTl8YDmUvH4gOipqYVh+X3fBfTyuT4aeujR7jEIjnH8Er+AiWa1qYTJnU5YKd5GAcJCWWHsH/vIQBYCbxvFQx3GN2Wd3h81XWr/ANqvaHB0jA/VF9WYS4JOa9bpVh8esaNi/j9dVUyTq2QIL8vQ6eMjz2aqwPH82PZjUGoNtAYBsmX5rV5hlizlGtPKbg/A4vvQcLmTR205de6ySMzOlqG/bb4FU/ZpzL+RJ83z+fF9Bz+iwuLi0x/VNZ657IK';
      
      // Try to play both videos simultaneously
      const playPromise1 = testVideo1.play();
      const playPromise2 = testVideo2.play();
      
      // Check if both can play simultaneously
      Promise.all([
        playPromise1.catch(() => false), 
        playPromise2.catch(() => false)
      ]).then(results => {
        const bothPlayed = results[0] !== false && results[1] !== false;
        setState(prev => ({...prev, supportsMultipleVideos: bothPlayed}));
        
        // Clean up
        setTimeout(() => {
          [testVideo1, testVideo2].forEach(vid => {
            vid.pause();
            document.body.removeChild(vid);
          });
        }, 100);
      });
    }
  }, []);

  return state;
}
