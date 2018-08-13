# Circular Sliders

A Javascript package which allows you to draw concentric responsive circular sliders.

## Usage

Create a div where you would like the sliders to go:

    <div id="drawing" style="border:1px solid;margin: 20px;height: 300px; width: 600px;"></div>

Add a sliders canvas with id of div and array of options for your sliders:

    new CircularSliders.Canvas("drawing", [{type: "Shoe"},{name: "foo-bar"}]);

### Options

Slider options:

| Name            | Type    | Default                             | Description                                            |
| --------------- | ------- | ----------------------------------- | ------------------------------------------------------ |
| name            | String  | Slider n                            | Name your slider                                       |
| type            | String  | Plain                               | Pick between various types for interesting graphics at the center of the slider: 'Height', 'Weight', 'Shoe', 'Waist', and more to come |
| centerX         | Float   | Center of canvas or previous slider | Specify the x value for the center of the slider       |
| centerY         | Float   | Center of canvas or previous slider | Specify the y value for the center of the slider       |
| color           | String  | "#0000FF"                           | Specify the color of the arc fill                      |
| minValue        | Float   | 0                                   | The minimum value of your slider                       |
| maxValue        | Float   | 100                                 | The maximum value of your slider                       |
| value           | Float   | minValue                            | Set initial value of slider on page load               |
| step            | Float   | 10                                  | The amount the value is incremented                    |
| units           | String  | ""                                  | The units your value is displayed in                   |
| priceUnits      | String  | ""                                  | Adds price ('$', '€', '£' ...) before value            |
| radius          | Float   | 40 or (previous slider radius + previous slider lineWidth + default slider lineWidth)  | The radius of your slider  |
| lineWidth       | Float   | 5                                   | The slider and arc width                               |
| strokeColor     | String  | "#D3D3D3"                           | The color of the dashes on the slider                  |
| ballColor       | String  | "#000000"                           | The color of the slider ball                           |
| gradientFill    | Boolean | true                                | Specify whether you would like the image in the center (for specified type) of the slider to fill with the slider's color as you scale the slider |
| legend          | Object  | { display: true, font: "12px Arial", color: "#000000" } | Specify whether you would like the slider name, value and units listed in the top left corner of the canvas and the font and color which it's displayed in  |

### Global Options

To set options for all of your sliders, use:

    CircularSliders.defaults.color = "#FF7F50";

## Installation

Run

    npm install circular-sliders

### API

Access a canvas with:

    var canvas = CircularSliders.canvases["div-id"]

Retrieve the sliders objects with:

    canvas.getSliders()

Retrieve an individual slider object with:

    var slider = canvas.getSliderByName(name)

Retrieve slider attributes with:

    slider.value;


<!-- ## Development -->

<!-- To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org). -->


## Contributing

  1. Fork it
  1. Create your feature branch (`git checkout -b my-new-feature`)
  1. Commit your changes (`git commit -am 'Add some feature'`)
  1. Push to the branch (`git push origin my-new-feature`)
  1. Create new Pull Request

Bug reports and pull requests are welcome on GitHub at https://github.com/speterlin/circular-sliders.js. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.


## License

The gem is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
