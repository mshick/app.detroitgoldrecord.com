### Our API provides:

`GET /api/videos/NTQ8fpxFBTrv_GfKJ3h4_w`

```json
{
    "createdAt": "2014-09-03T16:52:41.102Z",
    "id": "NTQ8fpxFBTrv_GfKJ3h4_w",
    "hkey": "instagram:abc",
    "provider": "instagram",
    "providerId": "abc",
    "providerPermalinkUrl": "http://instagr.am/p/D/",
    "providerUsername": "kevin",
    "providerUserId": "3",
    "thumbnailUrl": "http://distilleryimage2.ak.instagram.com/11f75f1cd9cc11e2a0fd22000aa8039a_6.jpg",
    "videoUrl": "http://distilleryvesper9-13.ak.instagram.com/090d06dad9cd11e2aa0912313817975d_101.mp4",
    "videoLowUrl": "http://distilleryvesper9-13.ak.instagram.com/090d06dad9cd11e2aa0912313817975d_102.mp4",
    "description": "",
    "explicit": false,
    "approved": true,
    "hidden": true,
    "updatedBy": "admin",
    "type": "video"
}
```

Or

`GET /api/videos`

```json
{
    "type": "videoList",
    "count": 1,
    "orderBy": "createdAt",
    "sort": "desc",
    "items": [{
        "createdAt": "2014-09-03T16:52:41.102Z",
        "id": "NTQ8fpxFBTrv_GfKJ3h4_w",
        "hkey": "instagram:abc",
        "provider": "instagram",
        "providerId": "abc",
        "providerPermalinkUrl": "http://instagr.am/p/D/",
        "providerUsername": "kevin",
        "providerUserId": "3",
        "thumbnailUrl": "http://distilleryimage2.ak.instagram.com/11f75f1cd9cc11e2a0fd22000aa8039a_6.jpg",
        "videoUrl": "http://distilleryvesper9-13.ak.instagram.com/090d06dad9cd11e2aa0912313817975d_101.mp4",
        "videoLowUrl": "http://distilleryvesper9-13.ak.instagram.com/090d06dad9cd11e2aa0912313817975d_102.mp4",
        "description": "",
        "explicit": false,
        "approved": true,
        "hidden": true,
        "updatedBy": "admin",
        "type": "video"
    }]
}
```


### Instagram Sample

`https://api.instagram.com/v1/tags/video/media/recent?client_id=8d3634717a5d41d290c56405357e62e3?count=5&max_tag_id=111&min_tag_id=222`

```json
{
    "type": "video",
    "videos": {
        "low_resolution": {
            "url": "http://distilleryvesper9-13.ak.instagram.com/090d06dad9cd11e2aa0912313817975d_102.mp4",
            "width": 480,
            "height": 480
        },
        "standard_resolution": {
            "url": "http://distilleryvesper9-13.ak.instagram.com/090d06dad9cd11e2aa0912313817975d_101.mp4",
            "width": 640,
            "height": 640
        },
    "users_in_photo": null,
    "filter": "Vesper",
    "tags": ["snow"],
    "comments": {
        "data": [{
            "created_time": "1279332030",
            "text": "Love the sign here",
            "from": {
                "username": "mikeyk",
                "full_name": "Mikey Krieger",
                "id": "4",
                "profile_picture": "http://distillery.s3.amazonaws.com/profiles/profile_1242695_75sq_1293915800.jpg"
            },
            "id": "8"
        },
        {
            "created_time": "1279341004",
            "text": "Chilako taco",
            "from": {
                "username": "kevin",
                "full_name": "Kevin S",
                "id": "3",
                "profile_picture": "..."
            },
            "id": "3"
        }],
        "count": 2
    },
    "caption": null,
    "likes": {
        "count": 1,
        "data": [{
            "username": "mikeyk",
            "full_name": "Mikeyk",
            "id": "4",
            "profile_picture": "..."
        }]
    },
    "link": "http://instagr.am/p/D/",
    "user": {
        "username": "kevin",
        "full_name": "Kevin S",
        "profile_picture": "...",
        "bio": "...",
        "website": "...",
        "id": "3"
    },
    "created_time": "1279340983",
    "images": {
        "low_resolution": {
            "url": "http://distilleryimage2.ak.instagram.com/11f75f1cd9cc11e2a0fd22000aa8039a_6.jpg",
            "width": 306,
            "height": 306
        },
        "thumbnail": {
            "url": "http://distilleryimage2.ak.instagram.com/11f75f1cd9cc11e2a0fd22000aa8039a_5.jpg",
            "width": 150,
            "height": 150
        },
        "standard_resolution": {
            "url": "http://distilleryimage2.ak.instagram.com/11f75f1cd9cc11e2a0fd22000aa8039a_7.jpg",
            "width": 612,
            "height": 612
        }
    },
    "id": "3",
    "location": null
}
```

### Vine Sample

Thumbnail is: 480x480
Video (both) is: 480x480

`https://api.vineapp.com/timelines/tags/snow?page=0`

```json
{
    "code": "",
    "data": {
        "count": 499,
        "anchorStr": "1118024576287547392",
        "records": [{
            "liked": 0,
            "videoDashUrl": null,
            "foursquareVenueId": null,
            "userId": 1115439463523364864,
            "private": 0,
            "likes": {
                "count": 11,
                "anchorStr": "1118426464522809345",
                "records": [{
                    "username": "Katty Myb",
                    "videoUrl": null,
                    "verified": 0,
                    "vanityUrls": [],
                    "created": "2014-09-02T03:17:42.000000",
                    "locale": "TR",
                    "flags|platform_lo": 0,
                    "userId": 1117466333928714240,
                    "user": {
                        "private": 0
                    },
                    "videoDashUrl": null,
                    "postId": 1118426225069961216,
                    "likeId": 1118426464522809345,
                    "flags|platform_hi": 0
                },
                ...],
                "previousPage": null,
                "backAnchor": "",
                "anchor": 1118426464522809345,
                "nextPage": 2,
                "size": 10
            },
            "loops": {
                "count": 945.0,
                "velocity": 0.23666666666666666,
                "onFire": 0
            },
            "thumbnailUrl": "http://v.cdn.vine.co/r/thumbs/85773ACE311118426108723896320_2.5.1.17795992404114225334.mp4.jpg?versionId=XxkCPjic_XewbEu2D.BL_TYWazvP24u6",
            "explicitContent": 0,
            "myRepostId": 0,
            "vanityUrls": [],
            "verified": 0,
            "avatarUrl": "http://v.cdn.vine.co/r/avatars/78DD857AC21116249162065895424_20b746e47d3.5.1.jpg?versionId=kZ2ZEpMwK21w9Gj7QySfN81Uhd7bTUxN",
            "comments": {
                "count": 11,
                "anchorStr": "1118426897664376832",
                "records": [],
                "previousPage": null,
                "backAnchor": "",
                "anchor": 1118426897664376832,
                "nextPage": 2,
                "size": 10
            },
            "entities": [{
                "link": "vine://tag/follows",
                "range": [12, 20],
                "type": "tag",
                "id": 908832797584801792,
                "title": "follows"
            }, {
                "link": "vine://tag/vinegame",
                "range": [21, 30],
                "type": "tag",
                "id": 910252613449289728,
                "title": "vinegame"
            }, {
                "link": "vine://tag/class",
                "range": [31, 37],
                "type": "tag",
                "id": 906295492617707521,
                "title": "class"
            }, {
                "link": "vine://tag/TXVineMeetup",
                "range": [38, 51],
                "type": "tag",
                "id": 995897043962839040,
                "title": "txvinemeetup"
            }, {
                "link": "vine://tag/impression",
                "range": [52, 63],
                "type": "tag",
                "id": 907460892206313473,
                "title": "impression"
            }, {
                "link": "vine://tag/Vinewalk",
                "range": [64, 73],
                "type": "tag",
                "id": 908900037122330624,
                "title": "vinewalk"
            }, {
                "link": "vine://tag/snow",
                "range": [74, 79],
                "type": "tag",
                "id": 906270061453651968,
                "title": "snow"
            }, {
                "link": "vine://tag/singforwill",
                "range": [80, 92],
                "type": "tag",
                "id": 983615514662416384,
                "title": "singforwill"
            }, {
                "link": "vine://tag/revine",
                "range": [93, 100],
                "type": "tag",
                "id": 908616050818691072,
                "title": "revine"
            }, {
                "link": "vine://tag/popular",
                "range": [101, 109],
                "type": "tag",
                "id": 906324153437786112,
                "title": "popular"
            }, {
                "link": "vine://tag/Trending",
                "range": [110, 119],
                "type": "tag",
                "id": 906417227929235456,
                "title": "trending"
            }, {
                "link": "vine://tag/grindonme",
                "range": [120, 130],
                "type": "tag",
                "id": 932141062196318208,
                "title": "grindonme"
            }, {
                "link": "vine://tag/twerk",
                "range": [131, 137],
                "type": "tag",
                "id": 907759658188677120,
                "title": "twerk"
            }],
            "videoLowURL": "http://v.cdn.vine.co/r/videos_r1/BA981F38931118426104940711936_2bcc39f0aa3.5.1.17795992404114225334.mp4?versionId=HL4OTM3A.rN_aZ_Qrk2X7wvg9nk7ioD6",
            "permalinkUrl": "https://vine.co/v/OB2mjqPAUbY",
            "username": "Matt McNuggey.",
            "description": "Bye robots. #follows #vinegame #class #txvinemeetup #impression #vinewalk #snow #singforwill #revine #popular #trending #grindonme #twerk",
            "tags": [],
            "postId": 1118426225069961216,
            "videoUrl": "http://v.cdn.vine.co/r/videos/BA981F38931118426104940711936_2bcc39f0aa3.5.1.17795992404114225334.mp4?versionId=I11.K20freKG8uezLx_tx6l5jFMyDFyx",
            "created": "2014-09-02T03:16:45.000000",
            "shareUrl": "https://vine.co/v/OB2mjqPAUbY",
            "profileBackground": "0xffaf40",
            "promoted": 0,
            "reposts": {
                "count": 0,
                "anchorStr": null,
                "records": [],
                "previousPage": null,
                "backAnchor": "",
                "anchor": null,
                "nextPage": null,
                "size": 10
            }
        }, {
            "liked": 0,
            "videoDashUrl": null,
            "foursquareVenueId": null,
            "userId": 1103456762880778240,
            "private": 0,
            "likes": {
                "count": 47,
                "anchorStr": "1118426883537661952",
                "records": [{
                    "username": "Princess Zainab",
                    "videoUrl": null,
                    "verified": 0,
                    "vanityUrls": [],
                    "created": "2014-09-02T03:19:22.000000",
                    "locale": "US",
                    "flags|platform_lo": 0,
                    "userId": 954221544958242816,
                    "user": {
                        "private": 0
                    },
                    "videoDashUrl": null,
                    "postId": 1118408774424604672,
                    "likeId": 1118426883537661952,
                    "flags|platform_hi": 0
                }...],
                "previousPage": null,
                "backAnchor": "",
                "anchor": 1118426883537661952,
                "nextPage": 2,
                "size": 10
            },
            "loops": {
                "count": 1821.0,
                "velocity": 0.16333333333333333,
                "onFire": 0
            },
            "thumbnailUrl": "http://v.cdn.vine.co/r/thumbs/574C739A731118408768623988736_2.5.1.7057713986580379097.mp4.jpg?versionId=VjfOeCK_nAsNvhxdXnaY1jWRBd5crZr8",
            "explicitContent": 0,
            "myRepostId": 0,
            "vanityUrls": [],
            "verified": 0,
            "avatarUrl": "http://v.cdn.vine.co/r/avatars/2532E5FD341115127052799045632_20acd32ee52.5.1.jpg?versionId=vfdrlQWevGz99shiCNp3WLiyny3yDgco",
            "comments": {
                "count": 7,
                "anchorStr": "1118408795492687872",
                "records": [],
                "previousPage": null,
                "backAnchor": "",
                "anchor": 1118408795492687872,
                "nextPage": null,
                "size": 10
            },
            "entities": [],
            "videoLowURL": "http://v.cdn.vine.co/r/videos_r1/9FC9DBFAFA1118408767491686400_21e8d3b25a3.5.1.7057713986580379097.mp4?versionId=2lmetq7r3P8G059eKE2jVyS.T6UANAuj",
            "permalinkUrl": "https://vine.co/v/OBQDVrmJDrD",
            "username": "Tish",
            "description": "Follow and Revine for Followback \u270c\ufe0f",
            "tags": [],
            "postId": 1118408774424604672,
            "videoUrl": "http://mtc.cdn.vine.co/r/videos/9FC9DBFAFA1118408767491686400_21e8d3b25a3.5.1.7057713986580379097.mp4?versionId=A5j3U2k5U1533kUo9_jm0YDGs2yZC26s",
            "created": "2014-09-02T02:07:24.000000",
            "shareUrl": "https://vine.co/v/OBQDVrmJDrD",
            "profileBackground": "0x33ccbf",
            "promoted": 0,
            "reposts": {
                "count": 38,
                "anchorStr": "1118423415003504640",
                "records": [],
                "previousPage": null,
                "backAnchor": "",
                "anchor": 1118423415003504640,
                "nextPage": 2,
                "size": 10
            }
        }]
    },
    "success": true,
    "error": ""
}
```
