

if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame;
    } )();
};

var main=function() {

    var audio = document.getElementById("audio");
    audio.mozFrameBufferLength = 4096;
    audio.addEventListener('MozAudioAvailable', audioAvailable, false);
    audio.addEventListener('loadedmetadata', loadedMetadata, false);
    audio.play();

    var channels = 2,
        rate,
        frameBufferLength,
        fft,
        magnitude;

    channels          = audio.mozChannels;
    rate              = audio.mozSampleRate;
    frameBufferLength = audio.mozFrameBufferLength;

    fft = new FFT(frameBufferLength / channels, rate);

    function audioAvailable(event) {
        var fb = event.frameBuffer,
            t  = event.time,
            signal = new Float32Array(fb.length / channels);


        for (var i = 0, fbl = frameBufferLength / 2; i < fbl; i++ ) {
          // Assuming interlaced stereo channels,
          // need to split and merge into a stero-mix mono signal
          signal[i] = (fb[2*i] + fb[2*i+1]) / 2;
        }

        fft.forward(signal);

        // Clear the canvas before drawing spectrum

        for (var i = 0; i < fft.spectrum.length; i++ ) {
          // multiply spectrum by a zoom value
          magnitude = fft.spectrum[i] * 4000;
        }
    }


    function loadedMetadata() {
        channels          = audio.mozChannels;
        rate              = audio.mozSampleRate;
        frameBufferLength = audio.mozFrameBufferLength;

        fft = new FFT(frameBufferLength / channels, rate);
    }

    var CANVAS=document.getElementById("canvas");
    CANVAS.width=window.innerWidth;
    CANVAS.height=window.innerHeight;

    var AMORTIZATION=0.95;
    var drag=false;


    var old_x, old_y;

    var dX=0, dY=0;



    var mouseDown=function(e) {
        drag=true;
        old_x=e.pageX, old_y=e.pageY;
        e.preventDefault();
        return false;
    }

    var mouseUp=function(e){
        drag=false;
    }

    var mouseMove=function(e) {
        if (!drag) return false;
        dX=(e.pageX-old_x)*2*Math.PI/CANVAS.width,
            dY=(e.pageY-old_y)*2*Math.PI/CANVAS.height;
        THETA+=dX;
        PHI+=dY;
        old_x=e.pageX, old_y=e.pageY;
        e.preventDefault();
    }

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);

    /*========================= GET WEBGL CONTEXT ========================= */
    try {
        var GL = CANVAS.getContext("experimental-webgl", {antialias: true});
    } catch (e) {
        alert("You are not webgl compatible :(") ;
        return false;
    } ;

    /*========================= SHADERS ========================= */


    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function sineWave(vertices, rate, count, time, magnitude){
        var zOffset =0;
        var verts = vertices;
        var elementLength = rate*2*9;
        for(var i = 0 ;i<count;i++){
            var angle = LIBS.degToRad(360/count*i+time/1000+magnitude);
            zOffset = Math.sin(angle);
            for(var j=i*rate*2; j<elementLength; j+=18){
                //console.log(zOffset);
                verts[j+2] = zOffset;
                //verts[j+11] = vertices[j+11]+zOffset;
            }

        }
        return verts;
    }

    function zOffset(vertices, rate, count, magnitude){
        for(var j=0;j<count; j++){
            for(var i=j*rate; i<j*rate*18; i+=18){
                vertices[i+2] = j==0?magnitude:magnitude/j;
                vertices[i+11] = j==0?-1*magnitude:-1*magnitude/j;
            }
        }
    }

    function vibration(vertices, rate, count, magnitude, time){
        for(var i=0; i<vertices.length; i+=18){
            vertices[i+2] = magnitude;
            vertices[i+11] = -1*magnitude;
        }
    }

    var shader_vertex=getShader(GL, "light-shader-vs");
    var shader_fragment=getShader( GL, "light-shader-fs");

    var SHADER_PROGRAM=GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);

    GL.linkProgram(SHADER_PROGRAM);

    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
    var _wsLightPosition = GL.getUniformLocation(SHADER_PROGRAM, "wsLightPosition");
    var _alpha = GL.getUniformLocation(SHADER_PROGRAM, "alpha");

    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    var _normal = GL.getAttribLocation(SHADER_PROGRAM, "normal");

    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_color);
    GL.enableVertexAttribArray(_normal);

    GL.useProgram(SHADER_PROGRAM);

    /*========================= THE MODEL ========================= */

    /*========================= MATRIX ========================= */

    var PROJMATRIX=LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
    var MOVEMATRIX=LIBS.get_I4();
    var VIEWMATRIX=LIBS.get_I4();

    var THETA=0,
        PHI=0;

    LIBS.translateZ(VIEWMATRIX, -10);

    /*========================= DRAWING ========================= */
    //GL.enable(GL.DEPTH_TEST);
    //GL.depthFunc(GL.LEQUAL);
    GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE);
    GL.clearColor(0.0, 0.0, 0.0, 0.0);
    GL.clearDepth(1.0);

    var vertexBuffer= GL.createBuffer ();
    var facesBuffer = GL.createBuffer ();

    var time_old=0;
    var scaleFactor = 1;
    var nextStart = 0;
    var maxCount = 50;
    var minCount = 10;

    var count = 0;
    var up = true;
    var oldMagnitude = 0;
    var model = primitives.cylinders(0.2,0,4,10);
    var animate=function(time) {
        var dt=time-time_old;
        if (!drag) {
            dX*=AMORTIZATION, dY*=AMORTIZATION;
            THETA+=dX, PHI+=dY;
        }
        scaleFactor+=0.01;
        nextStart+=0.05;
        if(nextStart>0.5){
            if(up){
                count++;
                up = count<maxCount;
            }else{
                count--;
                up = count<minCount;
            }
            nextStart = 0;
        }

        LIBS.set_I4(MOVEMATRIX);
        LIBS.rotateY(MOVEMATRIX, THETA);
        LIBS.rotateX(MOVEMATRIX, PHI);
        /*LIBS.scaleX(MOVEMATRIX, 1+(oldMagnitude+magnitude)/20);
        LIBS.scaleY(MOVEMATRIX, 1+(oldMagnitude+magnitude)/20);
        oldMagnitude = magnitude;*/

        time_old=time;

        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
        GL.uniform3f(_wsLightPosition, 1,1,5);
        GL.uniform1f(_alpha,0.6);

        if(model){
            if(nextStart>0.1 && magnitude>0.3){
                zOffset(model.vertices, model.rate, model.count, magnitude*10);
                var el =  $("#magnitude span");
                el.after('<span>'+magnitude+'<br/></span>');
                $('#magnitude').children().slice(15).remove();

                GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer);
                GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(model.vertices), GL.STATIC_DRAW);

            }else{
                GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer);
                GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(model.vertices), GL.STATIC_DRAW);
            }

            GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*9,0) ;
            GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*9,3*4) ;
            GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false,4*9,6*4);

            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, facesBuffer);
            GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.faces), GL.STATIC_DRAW);

            GL.drawElements(GL.TRIANGLES, model.faces.length, GL.UNSIGNED_SHORT, 0);
        }
        GL.flush();

        window.requestAnimationFrame(animate);
    }
    animate(0);
}