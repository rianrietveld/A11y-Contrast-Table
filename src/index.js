import './styles/style.scss';

$(document).ready( function() {
    act_table_data();
    $( "#show_table" ).on( "click", act_table_data );
} );

function act_table_data() {
    let rows = [];
    let row  = 0;

    let background_colours_data = cleanup_colour_data( $("#act-settings-background-colors") );
    let foreground_colours_data = cleanup_colour_data( $("#act-settings-foreground-colors") );

    foreground_colours_data.forEach( (fg_data) => {

        background_colours_data.forEach( (bg_data) => {

            let ratio = act_calc_contrast(bg_data[0], fg_data[0]);
            let label = act_get_label( ratio );

            rows.push( [
                row,
                [bg_data[0], fg_data[0], ratio, label] ]
            );

        });

        row++;

    });

    act_table_write( rows, background_colours_data, foreground_colours_data );
}

function act_table_write(rows, background_colours_data, foreground_colours_data) {
    $( "tr" ).remove();
    $( "caption" ).after( '<tr class="header"></tr>' );

    let header_row = $( ".header" );
    header_row.append( '<td> </td>');
    background_colours_data.forEach((colour) => {
        header_row.append( '<th scope="col">' +  colour[0] + '<br />' + colour[1] + '</th>' );
    });

    foreground_colours_data.slice().reverse().forEach((colour) => {
        header_row.after( '<tr class="row"><th scope="row">' +  colour[0] + '<br />' + colour[1] + '</th></tr>');
    });

    $('.row').each(function(i) {
        let $this = $(this);
        let newClass = "row-" + i++;
        $this.addClass(newClass);
    });

    let current_row        = 0;
    let row_class          = '.row-0';
    let new_colour         = 0;
    let style              = "";
    let contrast_container = "";

    rows.forEach( ( colour ) => {

        new_colour = colour[0];

        if ( new_colour !== current_row ) {
            current_row++;
            row_class   = '.row-' + current_row;
        }

        if ( colour[1][1] !== colour[1][0] ) {
            contrast_container = '<div>' +  colour[1][2] + colour[1][3] + '</div>';
        } else {
            contrast_container = "";
        }


        style = ' style="color:' + colour[1][1] + '; background-color:' + colour[1][0] + ';"';
        $( row_class ).append( '<td' + style + '><span>Text</span>' + contrast_container + '</td>');

    });
}

function cleanup_colour_data( raw_data ) {
    let raw_data_array = raw_data.val().split(/\r?\n/);
    let data =[];

    raw_data_array.forEach( ( colour ) => {

        let value = colour.split(',');
        let hexcode = value[0];

        if ( ( hexcode.length === 7 ) && ( hexcode[0] === "#" ) ) {

            if (value[1] === undefined) {
                value[1] = '';
            }
            value[0] = value[0].toUpperCase();
            data.push( value );

        }

    });

    return data;
}


function act_get_label( ratio ) {

    if ( ratio < 3 ) {
        return ': Fail';
    } else if ( ratio < 4.5 ) {
        return ': LB';
    }
    return ': Pass';
}

// MIT Licensed function courtesy of Lea Verou
// https://github.com/LeaVerou/contrast-ratio/blob/gh-pages/color.js
Math.round = (function(){
    let round = Math.round;

    return function (number, decimals) {
        decimals = +decimals || 0;

        let multiplier = Math.pow(100, decimals);

        return round(number * multiplier) / multiplier;
    };
})();

let rgbClass = {
    "toString": function() {
        return '<r: ' + this.r +
            ' g: ' + this.g +
            ' b: ' + this.b +
            ' >';
    }
};

function getRGBFromHex(color) {
    let rgb = Object.create(rgbClass),
        rVal,
        gVal,
        bVal;

    if (typeof color !== 'string') {
        throw new Error('must use string');
    }

    rVal = parseInt(color.slice(1, 3), 16);
    gVal = parseInt(color.slice(3, 5), 16);
    bVal = parseInt(color.slice(5, 7), 16);

    rgb.r = rVal;
    rgb.g = gVal;
    rgb.b = bVal;

    return rgb;
}

function calculateSRGB(rgb) {
    let sRGB = Object.create(rgbClass),
        key;

    for (key in rgb) {
        if (rgb.hasOwnProperty(key)) {
            sRGB[key] = parseFloat(rgb[key] / 255, 10);
        }
    }

    return sRGB;
}

function calculateLRGB(rgb) {
    let sRGB = calculateSRGB(rgb);
    let lRGB = Object.create(rgbClass),
        key,
        val = 0;

    for (key in sRGB) {
        if (sRGB.hasOwnProperty(key)) {
            val = parseFloat(sRGB[key], 10);
            if (val <= 0.03928) {
                lRGB[key] = val / 12.92;
            } else {
                lRGB[key] = Math.pow(((val + 0.055) / 1.055), 2.4);
            }
        }
    }

    return lRGB;
}

function calculateLuminance(lRGB) {
    return (0.2126 * lRGB.r) + (0.7152 * lRGB.g) + (0.0722 * lRGB.b);
}

function getContrastRatio(lumA, lumB) {
    let ratio,
        lighter,
        darker;

    if (lumA >= lumB) {
        lighter = lumA;
        darker = lumB;
    } else {
        lighter = lumB;
        darker = lumA;
    }

    ratio = (lighter + 0.05) / (darker + 0.05);
    return Math.round(ratio, 1);
}

function act_calc_contrast(foregroundColor, backgroundColor) {
    let color1 = getRGBFromHex(foregroundColor),
        color2 = getRGBFromHex(backgroundColor),
        l1RGB  = calculateLRGB(color1),
        l2RGB  = calculateLRGB(color2),
        l1     = calculateLuminance(l1RGB),
        l2     = calculateLuminance(l2RGB);

    return getContrastRatio(l1, l2);
}
