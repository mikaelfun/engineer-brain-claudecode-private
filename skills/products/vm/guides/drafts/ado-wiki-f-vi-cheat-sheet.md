---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/vi Cheat Sheet_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2Fvi%20Cheat%20Sheet_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

vi is an editor that comes included in every Linux distribution which can be used to make any kind of changes to a file.

## Prerequisite

None, vi comes installed in all unix and Linux distros.

## Manual

<span class="small"></span>

<span class="small"></span>

 <table class="wikitable" style="width:100%; text-align: left; border: hidden">
<tbody><tr>
<td style="border: hidden; width:50%"><b>Basic Usage</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   vim or vi           Run vim and open the given filename.
   w                   Save file.
   :x or SHIFT ZZ      Save and exit.
   :q                  Exit if no changes have been made.
   ZZ                  Exit and save changes if any have been made
   :q!                 Exit and undo any changes made.
   :set nu             Display line numbers.
</pre></div>
</td>
<td style="border: hidden; width:50%"><b>Entering Insert mode</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   i      At the cursor.
   I      Before the current line.
   a      After the cursor.
   A      After the current line.
   o      Insert a new line after the current line.
   O      Insert a new line before the current line.
   r      Replace one character
   R      Replace many characters
   C      Ovewrite the whold current line.
   ESC    Exit Insert mode.
</pre></div>
</td>
<td style="vertical-align:top">
</td></tr>
<tr>
<td style="border: hidden; width:50%"><b>Change commands - Changing text</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   C          Change to the end of the line
   cc         Change the whole line
   cw         Change word (Esc) 
   c$         Change to end of line 
   rc         Replace character with c 
   R          Replace (Esc) - typeover 
   s          Substitute (Esc) - 1 char with string 
   S          Substitute (Esc) - Rest of line with text 
   .          Repeat last change
</pre></div>
</td>
<td style="border: hidden; width:50%"><b>Change during insert mode</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   &lt;ctrl&gt;h         Back one character 
   &lt;ctrl&gt;w         Back one word 
   &lt;ctrl&gt;u         Back to beginning of insert
</pre></div>
</td>
<td style="vertical-align:top">
</td></tr>
<tr>
<td style="border: hidden; width:50%"><b>Deleting</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   x      Delete a single character to the right of cursor.
   X      Delete character to the left of cursor
   D      Delete to the end of the line.
   dd     Delete the entire current line.
   dw     Delete word to general buffer 
   dnw    Delete n words 
   d)     Delete to end of sentence 
   db     Delete previous word 
   ndw    Delete the next n words.
   ndd    Delete the next n lines.
   :d     Delete current line
   :x,yd  Delete from line x through to line y.
</pre></div>
<p><b>Search and Replace</b>
</p>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   /string                  Search forward for string.
   ?string                  Search back for string.
   n                        Find the next occurrence of string.
   N                        Search for previous instance of string
   :%s/string/replace/g     Replace every occurrence of string with replace..
   :s/pattern/string/flags  Replace pattern with string according to flags.
   g                        Flag - Replace all occurrences of pattern
   c                        Flag - Confirm replaces.
   &amp;                        Repeat last :s command
</pre></div>
</td>
<td style="border: hidden; width:50%"><b>Movement</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   h      Move left one character.
   j      Move down one character.
   k      Move up one character.
   l      Move right one character.
   w      Move forward one word.
   b      Move to the start of the word.
   B      Move to the beginning of blank delimted word
   e      Move to the end of the word.
   E      Move to the end of Blank delimited word
   W      Move to next blank delimited word
   H      Move to top of screen
   M      Move to middle of screen
   L      Move to botton of screen
   0      Move to the begining of the line
   (      Move back one sentence.
   )      Move forward one sentence.
   {      Move back one paragraph.
   }      Move forward one paragraph.
   ^      Move to the beginning of the line.
   $      Move to the end of the line.
   &lt;n&gt;G   Move to the nth line.
   1G     Move to the first line of the file
   G      Move to the last line.
   gg     Move to the first line.
   :n     Move to nth line of the file
   fc     Move forward to c
   Fc     Move back to c
   %      Move to associated ( ), { }, [ ]
</pre></div>
</td>
<td style="vertical-align:top">
</td></tr>
<tr>
<td style="border: hidden; width:50%"><b>Cut and Paste</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   p      Paste the clipboard contents.
   yy     Yank (copy) the current line.
   yw     Yank a word.
   y$     Yank to the end of the line.
   :y     Yank the current line
</pre></div>
</td>
<td style="border: hidden; width:50%"><b>Recovering deletions</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   p      Put general buffer after cursor 
   P      Put general buffer before cursor
</pre></div>
<p><b>Undo commands</b>
</p>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   u      Undo last change 
   U      Undo all changes on line
</pre></div>
</td>
<td style="vertical-align:top">
</td></tr>
<tr>
<td style="border: hidden; width:50%"><b>Ranges</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   :n,m           Range - Lines n-m
   :.             Range - Current line
   :$             Range - Last line
   :&#39;c            Range - Marker c
   :%             Range - All lines in file
   :g/pattern/    Range - All lines that contain pattern
</pre></div>
</td>
<td style="border: hidden; width:50%"><b>Markers</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   mc     Set marker c on this line
   `c     Go to beginning of marker c line.
   &#39;c     Go to first non-blank character of marker c line.
</pre></div>
</td>
<td style="vertical-align:top">
</td></tr>
<tr>
<td style="border: hidden; width:50%"><b>Files</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   :w file     Write to file
   :r file     Read file in after line
   :r !{cmd}   Execute {cmd} and insert its standard output below the cursor. 
   :n          Go to next file
   :p          Go to previos file
   :e file     Edit file
   !!program   Replace line with output from program
</pre></div>
</td>
<td style="border: hidden; width:50%"><b>Other</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   ~      Toggle upper and lower case
   J      Join lines
   .      Repeat last text-changing command
   u      Undo last change
   U      Undo all changes to line
</pre></div>
</td>
<td style="vertical-align:top">
</td></tr>
<tr>
<td style="border: hidden; width:50%"><b>Regular Expressions</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   . (dot)   Any single character except newline
   *         zero or more occurances of any character
   [...]     Any single character specified in the set
   [^...]    Any single character not specified in the set
   ^         Anchor - beginning of the line
   $         Anchor - end of line
   \&lt;        Anchor - begining of word
   \&gt;        Anchor - end of word
   \(...\)   Grouping - usually used to group conditions
   \n        Contents of nth grouping
</pre></div>
</td>
<td style="border: hidden; width:50%"><b>[...] - Set Examples</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>   [A-Z]          The SET from Capital A to Capital Z
   [a-z]          The SET from lowercase a to lowercase z
   [0-9]          The SET from 0 to 9 (All numerals)
   [./=+]         The SET containing . (dot), / (slash), =, and +
   [-A-F]         The SET from Capital A to Capital F and the dash (dashes must be specified
                  first)
   [0-9 A-Z]      The SET containing all capital letters and digits and a space
   [A-Z][a-zA-Z]  In the first position, the SET from Capital A to Capital Z. 
                  In the second character position, the SET containing all letters
</pre></div>
</td>
<td style="vertical-align:top">
</td></tr>
<tr>
<td colspan="2" style="border: hidden"><b>Regular Expression Examples</b>
<div class="mw-highlight mw-content-ltr" dir="ltr"><pre><span></span>    /Hello/       Matches if the line contains the value Hello
    /^TEST$/      Matches if the line contains TEST by itself
    /^[a-zA-Z]/   Matches if the line starts with any letter
    /^[a-z].*/    Matches if the first character of the line is a-z and there is at least one more of any character following it
    /2134$/       Matches if line ends with 2134
    /\(21|35\)/   Matches is the line contains 21 or 35. Note the use of ( ) with the pipe symbol to specify the &#39;or&#39; condition
    /[0-9]*/      Matches if there are zero or more numbers in the line
    /^[^#]/       Matches if the first character is not a # in the line

Notes:
1. Regular expressions are case sensitive
2. Regular expressions are to be used where pattern is specified
</pre></div>
</td>


## Reference

  - [Linux Tutorial - Vi Cheat Sheet](http://ryanstutorials.net/linuxtutorial/cheatsheetvi.php)
  - [Vi Cheat Sheet](http://www.lagmonster.org/docs/vi.html)



::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
