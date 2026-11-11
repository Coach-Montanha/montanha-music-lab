// Playlists Reais do Usuário Spotify 12186046104 (Coach Montanha)
export interface RealTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  source: 'spotify' | 'youtube';
  hasAudio: boolean;
}

export interface RealPlaylist {
  id: string;
  spotifyId: string;
  name: string;
  ownerUserName: string;
  provider: 'spotify';
  picture: string;
  songs: RealTrack[];
}

export const REAL_SPOTIFY_USER_PLAYLISTS: RealPlaylist[] = [
  {
    "id": "sp-pl-6GcFkXa6E6GMOgQnvoZYaL",
    "spotifyId": "6GcFkXa6E6GMOgQnvoZYaL",
    "name": "Barbecue Rock",
    "ownerUserName": "12186046104 (Coach Montanha)",
    "provider": "spotify",
    "picture": "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c92459ec0216dcdd5a3424cb0",
    "songs": [
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-0",
        "title": "Sweet Home Alabama",
        "artist": "Lynyrd Skynyrd",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485117e1907923e91181f38290ac",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-1",
        "title": "Californication",
        "artist": "Red Hot Chili Peppers",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485194d08ab63e57b0cae74e8595",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-2",
        "title": "Shake It Out",
        "artist": "Florence + The Machine",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048516a8c1075f751a78e0b7799c7",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-3",
        "title": "Don't Stop Believin'",
        "artist": "Journey",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851c5653f9038e42efad2f8a266",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-4",
        "title": "Only Time Will Tell",
        "artist": "Asia",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048516e70740d739b39db54fc4337",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-5",
        "title": "Rosanna",
        "artist": "TOTO",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851ebd6d20c0082524244ef83df",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-6",
        "title": "Your Love",
        "artist": "The Outfield",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851d8b8307316208d35b9d7094d",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-7",
        "title": "Under Pressure - Remastered 2011",
        "artist": "Queen",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851eda9fdf4406eb7a62471c2fa",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-8",
        "title": "Livin' On A Prayer",
        "artist": "Bon Jovi",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048511336b31b6a1799f0de5807ac",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-9",
        "title": "Beautiful Day",
        "artist": "U2",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485138fa0dfe55b1ff2e8c962bae",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-10",
        "title": "Dreams",
        "artist": "Van Halen",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485181e66f0aa00989cbe6030d57",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-11",
        "title": "Can't Stop Lovin' You",
        "artist": "Van Halen",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048515fdb9265aba3572a2c277c7c",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-12",
        "title": "Highway Tune",
        "artist": "Greta Van Fleet",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485157b7f789d328c205b4d15893",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-13",
        "title": "Long Train Runnin'",
        "artist": "The Doobie Brothers",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048517d419ac975423c069995c7bb",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-14",
        "title": "Listen to the Music",
        "artist": "The Doobie Brothers",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485191b51fa9b5967fb34c044498",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-15",
        "title": "Jet Airliner",
        "artist": "Steve Miller Band",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485191b7ae4634093109910f34fa",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-16",
        "title": "The Bitch Is Back",
        "artist": "Elton John",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048519e0666c9aaeb23723fc432e2",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-17",
        "title": "Running on Empty",
        "artist": "Jackson Browne",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048514eb24bfd49d01e0f3c57a410",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-18",
        "title": "More Than a Feeling",
        "artist": "Boston",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048518c1fadcc997a65384f34d694",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-19",
        "title": "Hold the Line",
        "artist": "TOTO",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851105ef588df1ef91bfa811f94",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-20",
        "title": "Burning Heart - From \"Rocky IV\" Soundtrack",
        "artist": "Survivor",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485127f6ab1746737ae97c94a617",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-21",
        "title": "Dreams - 2004 Remaster",
        "artist": "Fleetwood Mac",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851e52a59a28efa4773dd2bfe1b",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-22",
        "title": "Biggest Part of Me",
        "artist": "Ambrosia",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485106fa32a1ead2c464ec2e2511",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-23",
        "title": "Everybody Wants To Rule The World",
        "artist": "Tears For Fears",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851de484c8092bc37baa4d03ddc",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-24",
        "title": "Easy Lover",
        "artist": "Philip Bailey",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851c61fd7cba6914924fea49ea9",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-6GcFkXa6E6GMOgQnvoZYaL-25",
        "title": "Take It Easy - 2013 Remaster",
        "artist": "Eagles",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851c13acd642ba9f6f5f127aa1b",
        "source": "spotify",
        "hasAudio": true
      }
    ]
  },
  {
    "id": "sp-pl-0l4P7nqCrHO7IjMMhqaehi",
    "spotifyId": "0l4P7nqCrHO7IjMMhqaehi",
    "name": "My Workout",
    "ownerUserName": "12186046104 (Coach Montanha)",
    "provider": "spotify",
    "picture": "https://mosaic.scdn.co/300/ab67616d00001e028ca447e638e3873e3bded077ab67616d00001e02e0783b9378aa3857b8a9d24dab67616d00001e02e3a40a64f0473c111cf42b06ab67616d00001e02e773763694ac5eb7f2aa0a37",
    "songs": [
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-0",
        "title": "TRUST",
        "artist": "NF",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851e0783b9378aa3857b8a9d24d",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-1",
        "title": "Straight Out the Gate: (The Scott Stevens Remix) - Bonus Track",
        "artist": "Tech N9ne Collabos",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048518ca447e638e3873e3bded077",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-2",
        "title": "Undead",
        "artist": "Hollywood Undead",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851e3a40a64f0473c111cf42b06",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-3",
        "title": "Riot",
        "artist": "Three Days Grace",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851e773763694ac5eb7f2aa0a37",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-4",
        "title": "Bodies",
        "artist": "Drowning Pool",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485126d45b50f2016fed43d54320",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-5",
        "title": "Last Resort",
        "artist": "Papa Roach",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851985bf5ede2fe4a048ee85f28",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-6",
        "title": "In the End",
        "artist": "Linkin Park",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851e2f039481babe23658fc719a",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-7",
        "title": "Bring Me To Life",
        "artist": "Evanescence",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485125f49ab23f0ec6332efef432",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-8",
        "title": "Kryptonite",
        "artist": "3 Doors Down",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048512868c4713a3912fd476b42f1",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-9",
        "title": "I Stand Alone",
        "artist": "Godsmack",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851507420bb5f02ce7c5a4d20bc",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-10",
        "title": "Control",
        "artist": "Puddle Of Mudd",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485153cf4c30b11cf78c7bf6b793",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-11",
        "title": "Getting Away With Murder",
        "artist": "Papa Roach",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048512d5551c32546cafe3aafd939",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-12",
        "title": "Before I Forget",
        "artist": "Slipknot",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048516b3463e7160d333ada4b175a",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-13",
        "title": "1000hp",
        "artist": "Godsmack",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048515a8e1d4fd2058bf25dc7039c",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-14",
        "title": "Invincible",
        "artist": "Adelitas Way",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048519510924e4d72819a601a729d",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-15",
        "title": "CMFT Must Be Stopped (feat. Tech N9ne and Kid Bookie)",
        "artist": "Corey Taylor",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851fc59a34890629b2615c8130c",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-16",
        "title": "Hard (A Monster Made It)",
        "artist": "Tech N9ne Collabos",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048518ca447e638e3873e3bded077",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-17",
        "title": "The Beast (Album Version (Explicit))",
        "artist": "Tech N9ne",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851223e3402f4b554263ec5fc9f",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-18",
        "title": "Idol (feat. Tech N9ne)",
        "artist": "Hollywood Undead",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048513d04c4d537282aa8ec97aa50",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-19",
        "title": "Kickiter",
        "artist": "Tech N9ne",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048517f090f32125bf6a37473914a",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-20",
        "title": "Riot Maker (Album Version (Explicit))",
        "artist": "Tech N9ne",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851254a18ab90b3c871d4c08344",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-21",
        "title": "Boom",
        "artist": "P.O.D.",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485195741aa186187b05e0653245",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-22",
        "title": "Coming Undone",
        "artist": "Korn",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485174c1560b64750a1774495144",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-23",
        "title": "Duality",
        "artist": "Slipknot",
        "thumbnail": "https://i.scdn.co/image/ab67616d000048516b3463e7160d333ada4b175a",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-24",
        "title": "The Fight Song",
        "artist": "Marilyn Manson",
        "thumbnail": "https://i.scdn.co/image/ab67616d0000485197ce10b4cfeb26d2a93cc409",
        "source": "spotify",
        "hasAudio": true
      },
      {
        "id": "sp-tr-0l4P7nqCrHO7IjMMhqaehi-25",
        "title": "Your Betrayal",
        "artist": "Bullet For My Valentine",
        "thumbnail": "https://i.scdn.co/image/ab67616d00004851f467961e3089fd694c893584",
        "source": "spotify",
        "hasAudio": true
      }
    ]
  }
];
