var w = 1200, h = 600;
// var w = window.innerWidth, h = window.innerHeight;
var t0 = Date.now();


// defining the svg
var svg = d3.select("#planetarium").insert("svg")
    .attr("width", w).attr("height", h);


// Adding defs to the code for the gradients on the planet
svg.html(`<defs>
<radialGradient id="stellarB"  cx="20%" cy="50%" r="60%" fx="50%" fy="50%">
  <stop offset="0%" stop-color="#c1440e"/>
  <stop offset="100%" stop-color="#451804"/>
</radialGradient>

<radialGradient id="stellarA"  cx="20%" cy="50%" r="60%" fx="50%" fy="50%">
  <stop offset="0%" stop-color="#e77d11"/>
  <stop offset="100%" stop-color="#c1440e"/>
</radialGradient>

<radialGradient id="stellarF"  cx="20%" cy="50%" r="60%" fx="50%" fy="50%">
  <stop offset="0%" stop-color="#d7c797"/>
  <stop offset="100%" stop-color="#845422"/>
</radialGradient>

<radialGradient id="stellarG"  cx="20%" cy="50%" r="60%" fx="50%" fy="50%">
  <stop offset="0%" stop-color="#9fc164"/>
  <stop offset="100%" stop-color="#6b93d6"/>
</radialGradient>

<radialGradient id="stellarK"  cx="20%" cy="50%" r="60%" fx="50%" fy="50%">
  <stop offset="0%" stop-color="#6b93d6"/>
  <stop offset="100%" stop-color="#4f4cb0"/>
</radialGradient>

<radialGradient id="stellarM"  cx="20%" cy="50%" r="60%" fx="50%" fy="50%">
  <stop offset="0%" stop-color="#85a16b"/>
  <stop offset="100%" stop-color="#312828"/>
</radialGradient>
</defs>`)

//  Adding an image of the sun to act as our central star
svg.append("svg:image")
    .attr("x", -20 + w / 2)
    .attr("y", -20 + h / 2)
    .attr("class", "sun")
    .attr("xlink:href", "sun.png")
    .attr("width", 40)
    .attr("height", 40)
    .attr("text-anchor", "middle");


// Container to append the svg to.
var container = svg.append("g")
    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

// Defining the initial tooltip variable outside of our function
const toolTip = d3.select("#tooltip")

const data = planetData;

// function to read in the data and the initialize building the planets and orbits.
function init() {

    // checking to see if the data has all of the necessary data pieces
    planets = data.filter(d => d.Planet_Radius_Earth_Radii && d.Semi_Major_Axis_proportional && d.Orbital_Velocity_proportional);

    // turning all of the data from strings to numbers 
    planets.forEach((d) => {

        // planetary radius
        d.Planet_Radius_Earth_Radii = +d.Planet_Radius_Earth_Radii;

        // applying a logrithmic scale to get the orbits radius to show up and the abs value
        // Some of the data had negatives in it; Using as the distance from the star
        // Modified it to make the
        d.Semi_Major_Axis_proportional = Math.abs((35 * (Math.log(+d.Semi_Major_Axis_proportional))).toFixed(5));



        // Speed of the planet around its sun.
        d.Orbital_Velocity_proportional = +d.Orbital_Velocity_proportional / 3;

        //  temperature of the star that the planet is orbiting
        d.Effective_temperature_K = +d.Effective_temperature_K;
    });


    // Making the planets based on rplanet adius and distance from star
    container.selectAll("g.planet")
        .data(planets)
        .enter()
        .append("g")
        .attr("class", "planet")
        .each(function (d, i) {

            // Function that applies the scale of the stellar temp to the planets
            var planetClass = d.Effective_temperature_K >= 10000 ? "stellarB" :
                d.Effective_temperature_K >= 7500 ? "stellarA" :
                    d.Effective_temperature_K >= 6000 ? "stellarF" :
                        d.Effective_temperature_K >= 5000 ? "stellarG" :
                            d.Effective_temperature_K >= 3500 ? "stellarK" : "stellarM";

            // making the orbit
            d3.select(this).append("circle").attr("class", "orbit").attr("r", d.Semi_Major_Axis_proportional);

            // making the planet
            var exoplanet = d3.select(this)
                .append("circle")
                .attr("r", d.Planet_Radius_Earth_Radii)
                .attr("cx", d.Semi_Major_Axis_proportional)
                .attr("cy", 0)
                .attr("class", planetClass)
                .attr("id", "planet-body");
        });
    // phi0 is the starting angle
    var phi0 = 0;

    // starting point of the velosity and the axis
    let vel, axis = 0;

    // Using the timer function to rotate the planets
    d3.timer(function (delta) {
        // these are the x, y variables that will cause the 
        const x = (w / 2) + axis * Math.cos(toRad(delta * vel / 200))
        const y = (h / 2) + axis * Math.sin(toRad(delta * vel / 200))

        // The hover function for the planets tooltips.
        svg.selectAll(".planet")
            .attr("transform", function (datum) {
                return "rotate(" + phi0 + delta * datum.Orbital_Velocity_proportional / 200 + ")"
            }).selectAll('#planet-body')
            .on('mouseover', function (datum) {

                vel = datum.Orbital_Velocity_proportional
                axis = datum.Semi_Major_Axis_proportional
                // The text that shows up in the tooltips. Tooltip will stay until told otherwise
                toolTip.style("visibility", "visible");
                toolTip.select('.tooltip-container').html(`<div>Planet Name: <strong>${datum.Planet_Name}</strong></div>
                <div>Radius (Earth Radii): <strong>${datum.Planet_Radius_Earth_Radii}</strong></div>
                <div>Rotation (Days): <strong>${datum.Orbital_Period_days}</strong></div>
                <div>Stellar Temp (k): <strong>${datum.Effective_temperature_K}</strong></div>
                `)

            })
            .on("mouseout", function (datum) {

            })
        // rotating the tooltip with the planet
        toolTip
            .style('left', `${x - 125}px`)
            .style('top', `${y - 25}px`)
    });
};
// click function that allows you to remove the tooltip when you click elsewhere
svg.on("click", function () {
    toolTip.style("visibility", "hidden");
})

// converting degrees to radians for the cos/sin function.
function toRad(deg) {
    return deg * Math.PI / 180
}

// Created a var (array of objects) that has the Stellar classes and a y values for the legen placement
var stellarClass = [
    { "sClassName": "B [10,000 - 30,000 K]", "planetClass": "stellarB", "color": "#10E3F4", "y": 20 },
    { "sClassName": "A [7,500 - 10,000 K]", "planetClass": "stellarA", "color": "#CEF8FC", "y": 40 },
    { "sClassName": "F [6,000 - 7,500 K]", "planetClass": "stellarF", "color": "#F9FCA9", "y": 60 },
    { "sClassName": "G [5,000 - 6,000 K]", "planetClass": "stellarG", "color": "#EDF410", "y": 80 },
    { "sClassName": "K [3,500 - 5,000 K]", "planetClass": "stellarK", "color": "#F4AB10", "y": 100 },
    { "sClassName": "M [<3,500 K]", "planetClass": "stellarM", "color": "#F4AB10", "y": 120 }

];

// Appending a legend
container.append("g")
    .attr('id', 'legend')
    .selectAll("text").data(stellarClass).enter().append("text")
    .text(d => d.sClassName)
    .attr("class", d => d.planetClass)
    .attr("font-size", "20px")
    // .position("right")
    .attr("x", 350)
    .attr("y", d => 20 + d.y)
    .attr("font-family", "Oswald")
    .on("mouseover", function () {
        var selectedClass = d3.select(this).attr("class");
        // This allows only the planets we select to be seen when hovering over the legend values
        d3.selectAll("circle").style("opacity", 0.2).classed("selected-planets", false);
        d3.selectAll("." + selectedClass).style("opacity", 1).classed("selected-planets", true);
    })
    // This presents all of the planets once the cursor is no longer hovering.
    .on("mouseout", function () {
        d3.select(this).classed("selected-planets", false);
        d3.selectAll("circle").style("opacity", 1).classed("selected-planets", false);
    });

svg.append("text")
    .attr("class", "exoTitle")
    .attr("x", 50 + "px")
    .attr("y", 50 + "px")
    .style("fill","white")
	.attr("opacity", 1)
    .text("EXOPLANETS: ");

svg.append("text")
    .attr("class", "exoExplain")
    .attr("x", 50 + "px")
    .attr("y", 70 + "px")
    .style("fill","white")
    .attr("opacity", 1)
    .text("Are there habitable planets")

svg.append("text")
    .attr("class", "exoExplain2")
    .attr("x", 50 + "px")
    .attr("y", 90 + "px")
    .style("fill","white")
    .attr("opacity", 1)
    .text("outside of our solar system?")

    init()