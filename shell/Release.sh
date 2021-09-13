cd packages
version=$(npm version patch)
#npm publish
cd ..
git add .
git commit -m $version
git tag $version
# git push
# git push --tags
