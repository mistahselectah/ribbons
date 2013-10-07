
var LIBS={
    degToRad: function(angle){
        return(angle*Math.PI/180);
    },

    get_projection: function(angle, a, zMin, zMax) {
        var tan=Math.tan(LIBS.degToRad(0.5*angle)),
            A=-(zMax+zMin)/(zMax-zMin),
            B=(-2*zMax*zMin)/(zMax-zMin);

        return [
            .5/tan, 0 ,   0, 0,
            0, .5*a/tan,  0, 0,
            0, 0,         A, -1,
            0, 0,         B, 0
        ];
    },

    get_I4: function() {
        return [1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1];
    },

    set_I4: function(m) {
        m[0]=1, m[1]=0, m[2]=0, m[3]=0,
            m[4]=0, m[5]=1, m[6]=0, m[7]=0,
            m[8]=0, m[9]=0, m[10]=1, m[11]=0,
            m[12]=0, m[13]=0, m[14]=0, m[15]=1;
    },

    rotateX: function(m, angle) {
        var c=Math.cos(angle);
        var s=Math.sin(angle);
        var mv1=m[1], mv5=m[5], mv9=m[9];
        m[1]=m[1]*c-m[2]*s;
        m[5]=m[5]*c-m[6]*s;
        m[9]=m[9]*c-m[10]*s;

        m[2]=m[2]*c+mv1*s;
        m[6]=m[6]*c+mv5*s;
        m[10]=m[10]*c+mv9*s;
    },

    rotateY: function(m, angle) {
        var c=Math.cos(angle);
        var s=Math.sin(angle);
        var mv0=m[0], mv4=m[4], mv8=m[8];
        m[0]=c*m[0]+s*m[2];
        m[4]=c*m[4]+s*m[6];
        m[8]=c*m[8]+s*m[10];

        m[2]=c*m[2]-s*mv0;
        m[6]=c*m[6]-s*mv4;
        m[10]=c*m[10]-s*mv8;
    },

    rotateZ: function(m, angle) {
        var c=Math.cos(angle);
        var s=Math.sin(angle);
        var mv0=m[0], mv4=m[4], mv8=m[8];
        m[0]=c*m[0]-s*m[1];
        m[4]=c*m[4]-s*m[5];
        m[8]=c*m[8]-s*m[9];

        m[1]=c*m[1]+s*mv0;
        m[5]=c*m[5]+s*mv4;
        m[9]=c*m[9]+s*mv8;
    },

    translateZ: function(m, t){
        m[14]+=t;
    },

    scaleX: function(m, t){
        m[0]= m[0]*t;
    },

    scaleY: function(m, t){
        m[5] =m[5]*t;
    },

    scaleZ: function(m, t){
        m[10] = m[10]*t;
    },

    hsvToRgb: function (h, s, v) {
        var r, g, b;
        var i;
        var f, p, q, t;

        // Make sure our arguments stay in-range
        h = Math.max(0, Math.min(360, h));
        s = Math.max(0, Math.min(100, s));
        v = Math.max(0, Math.min(100, v));

        // We accept saturation and value arguments from 0 to 100 because that's
        // how Photoshop represents those values. Internally, however, the
        // saturation and value are calculated from a range of 0 to 1. We make
        // That conversion here.
        s /= 100;
        v /= 100;

        if(s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [r, g , b ];
        }

        h /= 60; // sector 0 to 5
        i = Math.floor(h);
        f = h - i; // factorial part of h
        p = v * (1 - s);
        q = v * (1 - s * f);
        t = v * (1 - s * (1 - f));

        switch(i) {
            case 0:
            r = v;
            g = t;
            b = p;
            break;

            case 1:
            r = q;
            g = v;
            b = p;
            break;

            case 2:
            r = p;
            g = v;
            b = t;
            break;

            case 3:
            r = p;
            g = q;
            b = v;
            break;

            case 4:
            r = t;
            g = p;
            b = v;
            break;

            default: // case 5:
            r = v;
            g = p;
            b = q;
        }

        return [r , g , b];
    }
}