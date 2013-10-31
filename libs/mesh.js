var Mesh = function(){
    this.coords = [];
    this.colors = [];
    this.normals = [];
    this.vertices = [];
    this.faces = [];

    this.length =  function(vector){
        return Math.sqrt(Math.pow(vector[0],2)+Math.pow(vector[1],2)+Math.pow(vector[2],2));
    }

    this.prepare = function(){
        for(var j = 0; j<this.coords.length;j+=3){
            this.vertices.push(
                this.coords[j],this.coords[j+1],this.coords[j+2],
                this.colors[j],this.colors[j+1],this.colors[j+2],
                this.normals[j],this.normals[j+1],this.normals[j+2]
            );
        }
    }

    this.getNormal =  function(a,b,c){
        var edge1 = this.subVector(a,b);
        var edge2 = this.subVector(a,c);
        return this.crossProduct(edge1,edge2);
    }

    this.getNormals =  function(){
        var a, b, c, normal;
        for(var j = 0; j<this.faces.length; j+=3){

            a = this.getCoords(this.coords,this.faces[j]);
            b = this.getCoords(this.coords, this.faces[j+1]);
            c = this.getCoords(this.coords, this.faces[j+2]);

            normal = this.getNormal(a,b,c);
            //this.normalize(normal);
            this.normals.push.apply(this.normals, normal);
            this.normals.push.apply(this.normals, normal);
            this.normals.push.apply(this.normals, normal);
        }
    }

    this.normalize =  function(){
        var x, y, z, a;
        for(var i = 0; i<this.normals.length/3;i+=3){
            x = this.normals[i];
            y = this.normals[i+1];
            z = this.normals[i+2];
            a = Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2));
            this.normals.splice(i,3,a*x/Math.abs(a),a*y/Math.abs(a),a*z/Math.abs(a));
        }
    }

    this.hash =  function(i0,i1){
        return i0.toString().concat(i1);
        //return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    }

    this.interpolateVector =  function(a, b){
        var result = [];
        result[0] = a[0] + b[0];
        result[1] = a[1] + b[1];
        result[2] = a[2] + b[2];
        return result;
    }

    this.subVector =  function(a,b){
        var result = [];
        result.push(b[0]-a[0], b[1]-a[1], b[2]-a[2]);
        return result;
    }

    this.crossProduct =  function(a, b){
        var result = [];
        result[0] = a[1] * b[2] - a[2] * b[1];
        result[1] = a[2] * b[0] - a[0] * b[2];
        result[2] = a[0] * b[1] - a[1] * b[0];
        return result;
    }

    this.getCoords =  function(vertArray, index){
        return [vertArray[3*index],vertArray[3*index+1],vertArray[3*index+2]];
    }

    this.getMidPointIndex =  function(hashes,i0,i1){

        var hash = this.hash(Math.min(i0,i1),Math.max(i0,i1));

        var index = hashes.indexOf(hash);

        for(var i = 0;i<hashes.count;i++){
            if(hashes[i].hash == hash){
                return hashes[i].index;
            }
        }

        var a = this.getCoords(this.coords,i0);
        var b = this.getCoords(this.coords,i1);

        var midpoint = [
            (a[0]+b[0])/2,
            (a[1]+b[1])/2,
            (a[2]+b[2])/2
        ];

        var radius  = this.length(a);
        var lengthM = this.length(midpoint);
        midpoint[0] *= radius/lengthM;
        midpoint[1] *= radius/lengthM;
        midpoint[2] *= radius/lengthM;

        index = this.coords.length/3;
        this.coords.push(midpoint[0],midpoint[1],midpoint[2]);
        hashes.push({hash: hash, index: index});

        return index;
    }

    this.subdivideFaces =  function(){
        var hashes=[];
        var facesLength = this.faces.length;
        var newFaces = [];

        for(var i = 0;i<facesLength-2;i+=3){
            var a, b, c, r, g, b, m01, m12, m02;

            var i0 = this.faces[i];
            var i1 = this.faces[i + 1];
            var i2 = this.faces[i + 2];


            m01  = this.getMidPointIndex(hashes, i0,i1);
            m12  = this.getMidPointIndex(hashes, i1,i2);
            m02  = this.getMidPointIndex(hashes, i0,i2);

            r = Math.abs(1);
            g = Math.abs(0);
            b = Math.abs(1);

            this.colors.push(r,g, b);
            this.colors.push(r,g, b);
            this.colors.push(r, g, b);

            /*newFaces.splice(i,3,
                i0,m01,m02,
                i1,m12,m01,
                i2,m02,m12,
                m02,m01,m12
            );*/

            this.faces.push(
                i0,m01,m02,
                i1,m12,m01,
                i2,m02,m12,
                m02,m01,m12
            );


        }
    }
}