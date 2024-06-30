const fs = require("fs");
const Papa = require("papaparse");
const { HubRestAPIClient } = require("@standard-crypto/farcaster-js-hub-rest");

// Initialize Farcaster client
const client = new HubRestAPIClient({ hubUrl: "https://hub.farcaster.standardcrypto.vc:2281" });

// Function to read CSV file and parse friends and followers
async function parseFriendsAndFollowers(csvFilePath, jsonFilePath) {
    // Read CSV file
    const fileContent = fs.readFileSync(csvFilePath, "utf8");

    // Parse CSV content
    Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        complete: async function (results) {
            const data = results.data;
            const profiles = [];

            for (let profile of data) {
                try {
                    // Fetch friends using Farcaster API
                    const friendsResponse = await client.getFriends(profile.id);
                    const friends = friendsResponse.data.map((friend) => friend.username);

                    // Fetch followers using Farcaster API
                    const followersResponse = await client.getFollowers(profile.id);
                    const followers = followersResponse.data.map((follower) => follower.username);

                    // Map to profile object
                    const profileData = {
                        id: profile.id,
                        name: profile.name,
                        friends: friends,
                        followers: followers,
                    };

                    // Add to profiles array
                    profiles.push(profileData);
                } catch (error) {
                    console.error(`Error fetching data for profile ID ${profile.id}:`, error);
                }
            }

            // Save profiles to JSON file
            fs.writeFileSync(jsonFilePath, JSON.stringify(profiles, null, 2));
            console.log(`Data saved to ${jsonFilePath}`);
        },
    });
}

// Example usage
parseFriendsAndFollowers("profiles.csv", "profiles.json");
