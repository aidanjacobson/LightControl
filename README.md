# Light control
Tool for controlling the colors of all the lights in the apartment.

Features a UI as well as a REST API for external controls. 

## User Interface
Remote URL: https://aidanjacobson.duckdns.org:9168/ui

Testing URL: http://localhost:9168/ui

# Color Type Documentation

Initially a String argument is passed in as color name. Color() will repeatedly reduce your color into one of two final states.

Example: ```red```, ```rainbow```, ```randomhsl```

## Final States

| Color.type | SetAll Effect
| --- | --- |
| rgb | All lights are set to rgb value |
| function | Each light will execute the provided function. This process is explained in detail below. |

When type is ```function``` each light will execute the given ```Color.function()``` as follows:

```
Color.function(LightEntity, floorplan): Color[type='rgb']

LightEntity {
    entity: String // home assistant entity name or segment name
    x: Position in floorplan from global South to North
    y: Position in floorplan from global West to East
}

floorplan: Reference to floorplan file data

Return Value: Color[type='rgb']
```

## Reduction Pattern

A ```String``` that matches the name of a saved color will be mapped to that saved color ```String```. Several thousand color names and hex values are saved.

| Color.type | Resulting Color.type | Explanation
| --- | --- | --- |
| gradient | function | a function that will return the light color along a gradient. Provided by Gradient class.
| colorspace | function | Different colors in all four corners |
| url | function | Set images from passed url |
| buffer | function |
| radial | function |
| colorMapping | function |

## String Reductions

| format | explanation |
|---|---|
| 'eval(JS)' | Evaluate JS and set Color from result |
| '{...}' | create color mapping function from json map |
| 'rgb(r, g, b)' | example: rgb(255, 127, 0) |
| 'hsl(h, s, l)' | hsl(120, 100, 50) |
| 'hue(h)' | hue(120) |
| 'url(UrlString)' | for image urls |
| 'colorspace(a, b, c, d)' | Set ColorSpace with 4 colors |

# API Documentation

API Endpoint is on the root level (e.g. http://localhost:9168/)

All reguests to API must include ```Security-key``` header. The header value should match the value of ```lightcontrol_access_token``` in the .env file.

## Set All Lights To Color
```
POST /setAll
post body: {
    color: String
}
```
or
```
GET /setAll/:color
```

## Send Image To Lights
```
POST /sendImage
post body {
    image: ImageFile
}
```

## Save Last Command
If last command was a function (e.g. randomhsl) then when the saved function executes, it will re-execute the original function.
```
POST /saveColor
post body {
    color: String
    name: String
}
```

## Save Current Color Scene
This comand will save the actual state of the lights, as well as settings for segmented lights.
```
POST /saveColorScene
post body {
    name: String
    nocache: Boolean
}
```
If nocache is true, pull colors from the light APIs before saving. May conflict with segmented modes


## Get access log
```
GET /getlog
```