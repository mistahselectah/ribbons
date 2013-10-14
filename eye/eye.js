

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
    audio.mozFrameBufferLength = 2048;
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

    var beatDetector = new BeatDetektor(50,99);

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

    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");
    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    var _normal = GL.getAttribLocation(SHADER_PROGRAM, "normal");

    GL.enableVertexAttribArray(_position);
    GL.enableVertexAttribArray(_color);
    GL.enableVertexAttribArray(_normal);

    GL.useProgram(SHADER_PROGRAM);

    /*========================= MATRIX ========================= */

    var PROJMATRIX=LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
    var MOVEMATRIX=LIBS.get_I4();
    var VIEWMATRIX=LIBS.get_I4();

    var THETA=0,
        PHI=0;

    LIBS.translateZ(VIEWMATRIX, -50);

    /*========================= DRAWING ========================= */
    //GL.enable(GL.DEPTH_TEST);
   //GL.depthFunc(GL.LEQUAL);
    GL.enable(GL.BLEND);
    GL.blendFunc(GL.SRC_ALPHA, GL.ONE);
    GL.clearColor(0.0, 0.0, 0.0, 0.0);
    GL.clearDepth(1.0);
    var time_old=0;

    function zOffset(vertices, rate, index, magnitude){
       for(var i = 0; i<rate*18; i+=18){
           vertices[index*rate*18+i+2]  = magnitude;
           vertices[index*rate*18+i+11] = -1*magnitude/5;
       }
    }

    function colorOffset(vertices, rate, index, magnitude){
       for(var i = 3; i<rate*18; i+=18){
           //var color = ;;
           vertices[index*rate*18+i]    = Math.abs(Math.sin(LIBS.degToRad(magnitude)));
           vertices[index*rate*18+i+1]  = Math.abs(Math.cos(LIBS.degToRad(magnitude)));
           vertices[index*rate*18+i+2]  = Math.abs(Math.tan(LIBS.degToRad(magnitude)));
           vertices[index*rate*18+i+11]    = Math.abs(Math.cos(LIBS.degToRad(magnitude)));
           vertices[index*rate*18+i+1+11]  = Math.abs(Math.tan(LIBS.degToRad(magnitude)));
           vertices[index*rate*18+i+2+11]  = Math.abs(Math.sin(LIBS.degToRad(magnitude)));
       }
    }

    var vertexBuffer= GL.createBuffer ();
    var facesBuffer = GL.createBuffer ();
    var count = 1;
    var rate = 4;
    var zFactor = 1;
    var model = primitives.cylinders(10,5,rate,count);
    //primitives.normalize(model.normals);
    model.vertices = primitives.prepareVertices(model);

    var itemIndex = 0;
    var fpsTime=0;
    var fpsFrames=0;
    var fpsEl = $("#fps");
    var bpmEl = $("#bpm");
    var peaks = $("#peaks");
    var timeEl = $("#time");
    var oldMagnitude;
    var interpolation = 10;
    var animate=function(time) {

        var dt=time-time_old;
        if(!beatDetector.win_bpm_int)
            beatDetector.process(Math.round(audio.currentTime),fft.spectrum);

        fpsTime+=dt;
        fpsFrames++;
        if (fpsTime>1000) {
            var fps=1000 * fpsFrames/fpsTime;
            fpsEl.text("FPS: "+Math.round(fps));
            bpmEl.text("BPM: "+beatDetector.win_bpm_int/10);
            timeEl.text("TIME: "+Math.round(audio.currentTime));
            fpsTime = fpsFrames = 0;
        }
        var vertices = model.vertices;
        var smoothFactor = (oldMagnitude-magnitude)/10000;
        var currentMagnitude = oldMagnitude+=smoothFactor;
        if(magnitude){
            if(magnitude>1){
                peaks.prepend('<li>'+magnitude+'</li>')
            }
            peaks.children().slice(10).remove();
            for(var  i = 0; i<interpolation; i++){
                if(vertices[itemIndex])
                zOffset(vertices,rate,itemIndex+i,currentMagnitude*10);
                colorOffset(vertices,rate,itemIndex+i,currentMagnitude*10);
            }

            if(itemIndex<count){
                itemIndex++;
            }else{
                itemIndex = 0;
            }


        }
        oldMagnitude = magnitude;


        if (!drag) {
            dX*=AMORTIZATION, dY*=AMORTIZATION;
            THETA+=dX, PHI+=dY;
        }

        /*nextStart+=0.05;
        if(nextStart>0.5){
            if(up){
                magnitude++;
                up = magnitude<maxCount;
            }else{
                magnitude--;
                up = magnitude<minCount;
            }
            nextStart = 0;
        }*/

        LIBS.set_I4(MOVEMATRIX);
        LIBS.rotateY(MOVEMATRIX, THETA);
        LIBS.rotateX(MOVEMATRIX, PHI);
        time_old=time;

        GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
        GL.uniform3f(_wsLightPosition, 0,0,20);

        GL.bindBuffer(GL.ARRAY_BUFFER, vertexBuffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);



        GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*9,0) ;
        GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*9,3*4) ;
        GL.vertexAttribPointer(_normal, 3, GL.FLOAT, false,4*9,6*4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, facesBuffer);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.faces), GL.STATIC_DRAW);

        GL.drawElements(GL.TRIANGLES, model.faces.length, GL.UNSIGNED_SHORT, 0);

        GL.flush();

        window.requestAnimationFrame(animate);
    }
    animate(0);
}