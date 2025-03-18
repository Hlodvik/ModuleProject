The Website:
    I really wanted to take the extra step to actually deploy this website, so I bought a 70 cent domain from ionos (readit.space) and learned to use firebase for deployment. 
    This website is clearly based off of Reddit, I started off by examining their source code. I couldn't find a font I liked so I took the svg section in reddit's navbar and edited the first d to look like an a. I also took the svg for their logo and put it in an editor, made it a little different, then saved it as a png. Still, wanted to say I got the code for the vectors directly from reddit and edited them. 

learned about the optional chaining operator when I felt there was far too many if statements in the script.
source=https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining

I put a lot of work into writing the hero section message, and I think it does a fair job at explaining the 'purpose' of the website. 
As for gradable content:

                                                                            Navigation Bar
                                                    Add a navbar with at least 3 links (e.g., Home, About, Contact).

using bootstrap classes made this easy breezey. icon is a home button, and theres a drop down with home, settings, logout, then the side navbar has communities the auth'd user is a member of

                                                                                  Home Page
                                                    Build a homepage that matches the feel of the website you’re emulating.
                                                    Include headings, images, and a hero section to introduce the site.
yeah I mean index has the hero section, while I may have ripped it off we got the favicon and icon in the navbar, etc... Not an obscene amount of images but they are there. and if this website stays up I have to imagine I'll be getting a cease and desist from reddit how close it looks! Home page matches, if there were more posts to fill up the feed they would look even closer.

                                                                            Form Section
                                                                            Add a form for user input.
                                                                            Examples:
                                                                            Contact form
                                                                            Sign-up form
                                                                            Booking form
                                                  Use at least two different input types (e.g., text, email, number, or date).
Sign up form FULLY functional, then edit profile forms just to be extra.

                                                                            Table 
                                                            Include a table to display relevant information.
                                                                            Examples:
                                                                            Event schedule
                                                                            Product comparison
                                                                            Price list    
user feed on profiles, users communities feed on home, community feed on community pages.

                                                                        3 Bootstrap Components 
                                                                        Choose any three Bootstrap components that suit your website.
                                                                        Examples:
                                                                        Cards to display projects or products
                                                                        Carousel to rotate images
                                                                        Modals for pop-ups
                                                                        Accordions for FAQs
                                                                        Integrate the components effectively to enhance the design of your site.

the three I've used are the sign-up modals, the tabs in settings, and the community cards that aren't quite functional in explore but are in the profile-setup page after sign-up. Then I know its not bootstrap but the gsap animations I feel is worth mentioning.


                                                                    SECTION 2. JAVASCRIPT


I WENT A LITTLE NUTS WITH THE JAVASCRIPT. 
I couldn't stop myself, honestly. I mean I have 20 something javascript modules there are plenty to choose from but the ones that took the most time learning was how to use the async functions, understanding promises, and reading way more than I ever wanted to about using Firestore. Other than the javascript related to reading and writing from the db, the other huge project I had was with the rich text editor. I started with a textarea and was dissapointed with the lack of text editing which reddit offers. So I went looking online how to set it up. It's a little buggy but it does work. Don't grade me on the image resizing bit, I explain it in the module too but I really wanted that feature to make the posts look better, but it was too tough for me to figure out on my own. besides the db and the text editor, I'm pretty thrilled with the functions I wrote creating unique id's, not every day you get to use fun math like that in real life.  Also spent a lot of time working on the sub domain functions in sub-dom.js. 

I did a pretty good job at keeping the profile page mobile friendly but failed to do so with the home page. Too determined to move on, Ive spent too long on this project already.


TODO
make everything mobile friendly. does ok on medium screens but not mobile.
Implement messaging.
Implement following users.
Implement comments.
Repair profile picture functions.
Finish Explore page.
