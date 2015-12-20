
/* ***********************

    MAIN CONTROLLER

*********************** */

app.controller('MainController', function($scope, $http, $filter, CheckSpecialFeature, dataURL) {


	/* DEFINE VARIABLES  */
	$scope.features = [];



	/* FILTER FEATURES */
	$scope.filterObj = {
		$: 'css'
	}
	$scope.chooseCategory = function(category) {
		$scope.filterObj = {
			$: category
		}
	}



	/* REQUEST */
    $http.get(dataURL).then(function(response) {

		var features = response.data.data;
		//console.log(response.data);

		// LOOP THROUGH ALL FEATURES
		angular.forEach(features, function(value, key) {

			var opera_stat_raw = value.stats['op_mini']['5.0-8.0']
			var opera_stat_clean = $filter('classStat')(opera_stat_raw);

			// ONLY PUSH FEATURES THAT ARE NOT SUPPORTED OR PARTIALLY SUPPORTED BY OPERA MINI
			if ( opera_stat_clean === 'not-supported' | opera_stat_clean === 'partial-support' ) {

				// PUSH VARIABLES NEEDED FOR LIST & FILTER
				$scope.features.push({
					key: key,
					special: CheckSpecialFeature(key),
					title: value.title,
					opera_stat_class: $filter('classStat')(opera_stat_raw),
					categories: value.categories
				})

			} /// endif not/partially supported

		}); // end angular.foreach

	}, function(error) {
		console.log("error: "+error);
	}) // end request



})





/* ***********************

    FEATURE CONTROLLER

*********************** */

app.controller('FeatureController', function($scope, $http, $filter, $routeParams, dataURL) {


	/* DEFINE VARIABLES  */
	var featureKey = $routeParams.featureKey;
	$scope.featureKey = featureKey;
	$scope.feature;
	$scope.notes = [];


	$('html, body').animate({
        scrollTop: $('body').offset().top
    }, 500);


	/* REQUEST */
	$http.get(dataURL).then(function(response) {

		var features = response.data.data;

		$scope.feature = features[featureKey];

		var opera_stat_raw = $scope.feature.stats['op_mini']['5.0-8.0']
		$scope.niceStat = $filter('niceStat')(opera_stat_raw);
		$scope.classStat = $filter('classStat')(opera_stat_raw);

		//console.log($scope.feature);


		// IF FEATURE HAS NOTES
		if ( opera_stat_raw.indexOf('#') > -1 ) {

			var notes = opera_stat_raw.split("#");
			notes.splice(0, 1);

			angular.forEach(notes, function(value, key) {
				var note_num = parseInt(value);
				var note = $scope.feature.notes_by_num[note_num];
				$scope.notes.push(note);
			})

		} // end if feature has notes


	}, function(error) {
		console.log("error: "+error);
	}) // end request



	/* WORKAROUNDS  */
	var workaroundURL =  'workarounds/' + featureKey + '.json';
	$scope.workarounds = [];

	function getWorkarounds() {

		$.getJSON(workaroundURL, function(response) {
			angular.forEach(response, function(value, key) {

				//console.log(value);

				// GET WORKAROUND DATA FROM GITHUM GIST URL 
				$http.get(value.raw_github_gist_file).then(function(response) {

					var workaround = {
						github_username: value.github_username,
						github_gist_url: value.github_gist_url,
						data: response.data
					}

					$scope.workarounds.push(workaround);

				}, function(error) {
					console.log(error);
				}) // end get workarounddata


				
			}) // end foreach workaround
		});	// end get workaround json file

	} // end getWorkarounds

	// GET WORKAROUNDS
	getWorkarounds();






});